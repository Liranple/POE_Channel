import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Redis 클라이언트 초기화
const redis = Redis.fromEnv();

const POSTS_KEY = "discussion:posts";

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
    const body = await request.json();
    const { action, data } = body;

    // 현재 게시글 가져오기
    let posts = (await redis.get(POSTS_KEY)) || [];

    switch (action) {
      case "create_post": {
        const newPost = {
          id: Date.now(),
          author: "익명",
          password: data.password,
          title: data.title,
          content: data.content,
          date: data.date,
          comments: [],
        };
        posts = [newPost, ...posts];
        break;
      }

      case "update_post": {
        posts = posts.map((post) =>
          post.id === data.id
            ? { ...post, title: data.title, content: data.content }
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
                  password: data.password,
                  content: data.content,
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
              ? { ...comment, content: data.content }
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
                password: data.password,
                content: data.content,
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
              reply.id === data.id ? { ...reply, content: data.content } : reply
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

    const isValid = targetPassword === password;
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Failed to verify password:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}
