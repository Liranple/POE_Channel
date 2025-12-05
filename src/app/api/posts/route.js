import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";

// Redis 클라이언트 초기화
const redis = Redis.fromEnv();

// Rate Limiter 설정 (분당 20회 제한)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1m"),
  analytics: true,
  prefix: "ratelimit:posts",
});

const POSTS_KEY = "discussion:posts";

// 입력값 길이 제한
const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 5000;
const MAX_PASSWORD_LENGTH = 50;

/**
 * 입력값 Sanitization - XSS 방지 및 길이 제한
 * @param {string} input - 원본 입력값
 * @param {number} maxLength - 최대 길이
 * @returns {string} - 정제된 문자열
 */
function sanitizeInput(input, maxLength = 10000) {
  if (typeof input !== "string") return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim()
    .slice(0, maxLength);
}

/**
 * IP 주소 추출
 */
function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIP || "127.0.0.1";
}

// 게시글 목록 조회
export async function GET() {
  try {
    const posts = await redis.get(POSTS_KEY);
    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// 게시글 생성
export async function POST(request) {
  try {
    // Rate Limiting 체크
    const ip = getClientIP(request);
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    // 현재 게시글 가져오기
    let posts = (await redis.get(POSTS_KEY)) || [];

    switch (action) {
      case "create_post": {
        const newPost = {
          id: Date.now(),
          author: "익명",
          password: sanitizeInput(data.password, MAX_PASSWORD_LENGTH),
          title: sanitizeInput(data.title, MAX_TITLE_LENGTH),
          content: sanitizeInput(data.content, MAX_CONTENT_LENGTH),
          date: data.date,
          comments: [],
        };
        posts = [newPost, ...posts];
        break;
      }

      case "update_post": {
        posts = posts.map((post) =>
          post.id === data.id
            ? {
                ...post,
                title: sanitizeInput(data.title, MAX_TITLE_LENGTH),
                content: sanitizeInput(data.content, MAX_CONTENT_LENGTH),
              }
            : post
        );
        break;
      }

      case "delete_post": {
        posts = posts.filter((post) => post.id !== data.id);
        break;
      }

      case "create_comment": {
        posts = posts.map((post) => {
          if (post.id === data.postId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: data.commentId,
                  author: "익명",
                  password: sanitizeInput(data.password, MAX_PASSWORD_LENGTH),
                  content: sanitizeInput(data.content, MAX_CONTENT_LENGTH),
                  date: data.date,
                  replies: [],
                },
              ],
            };
          }
          return post;
        });
        break;
      }

      case "update_comment": {
        posts = posts.map((post) => ({
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === data.id
              ? {
                  ...comment,
                  content: sanitizeInput(data.content, MAX_CONTENT_LENGTH),
                }
              : comment
          ),
        }));
        break;
      }

      case "delete_comment": {
        posts = posts.map((post) => ({
          ...post,
          comments: post.comments.filter((comment) => comment.id !== data.id),
        }));
        break;
      }

      case "create_reply": {
        posts = posts.map((post) => {
          if (post.id !== data.postId) return post;

          return {
            ...post,
            comments: post.comments.map((comment) => {
              if (comment.id !== data.commentId) return comment;

              const newReply = {
                id: data.replyId,
                author: "익명",
                password: sanitizeInput(data.password, MAX_PASSWORD_LENGTH),
                content: sanitizeInput(data.content, MAX_CONTENT_LENGTH),
                date: data.date,
                depth: data.depth || 0,
              };

              let newReplies = [...(comment.replies || [])];

              if (!data.parentReplyId) {
                // 댓글에 대한 답글은 맨 뒤에 추가
                newReplies.push(newReply);
              } else {
                // 답글에 대한 답글은 해당 답글 바로 뒤에 추가
                const parentIndex = newReplies.findIndex(
                  (r) => r.id === data.parentReplyId
                );
                if (parentIndex !== -1) {
                  let insertIndex = parentIndex + 1;
                  const parentDepth = newReplies[parentIndex].depth || 0;
                  // 부모 답글보다 깊이가 더 깊은 답글들 건너뜀
                  while (
                    insertIndex < newReplies.length &&
                    (newReplies[insertIndex].depth || 0) > parentDepth
                  ) {
                    insertIndex++;
                  }
                  newReplies.splice(insertIndex, 0, newReply);
                } else {
                  newReplies.push(newReply);
                }
              }

              return { ...comment, replies: newReplies };
            }),
          };
        });
        break;
      }

      case "update_reply": {
        posts = posts.map((post) => ({
          ...post,
          comments: post.comments.map((comment) => ({
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === data.id
                ? {
                    ...reply,
                    content: sanitizeInput(data.content, MAX_CONTENT_LENGTH),
                  }
                : reply
            ),
          })),
        }));
        break;
      }

      case "delete_reply": {
        posts = posts.map((post) => ({
          ...post,
          comments: post.comments.map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== data.id),
          })),
        }));
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Redis에 저장
    await redis.set(POSTS_KEY, posts);

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Failed to process request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// 비밀번호 검증
export async function PUT(request) {
  try {
    const { type, id, password, postId, commentId } = await request.json();

    const posts = (await redis.get(POSTS_KEY)) || [];

    let targetPassword = null;

    if (type === "post") {
      const post = posts.find((p) => p.id === id);
      targetPassword = post?.password;
    } else if (type === "comment") {
      for (const post of posts) {
        const comment = post.comments.find((c) => c.id === id);
        if (comment) {
          targetPassword = comment.password;
          break;
        }
      }
    } else if (type === "reply") {
      for (const post of posts) {
        for (const comment of post.comments) {
          const reply = comment.replies.find((r) => r.id === id);
          if (reply) {
            targetPassword = reply.password;
            break;
          }
        }
      }
    }

    if (targetPassword === null) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // 마스터 비밀번호 또는 원래 비밀번호로 검증
    const masterPassword = process.env.MASTER_PASSWORD;
    const isValid =
      targetPassword === password ||
      (masterPassword && password === masterPassword);
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Failed to verify password:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}
