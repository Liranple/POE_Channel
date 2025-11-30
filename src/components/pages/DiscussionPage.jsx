"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { BsArrowReturnRight } from "react-icons/bs";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import "../../styles/DiscussionPage.css";

// 초기 포스트 데이터 로드 함수
const getInitialPosts = () => {
  if (typeof window === "undefined") return [];
  const savedPosts = localStorage.getItem("poe_channel_discussion_posts");
  if (savedPosts) {
    return JSON.parse(savedPosts);
  }
  // 초기 샘플 데이터
  const samplePosts = [
    {
      id: 1,
      author: "익명",
      password: "admin",
      content:
        "자유 토론장에 오신 것을 환영합니다!\n자유롭게 의견을 나누고 정보를 공유해보세요.",
      date: "2025-11-29",
      comments: [],
    },
  ];
  localStorage.setItem(
    "poe_channel_discussion_posts",
    JSON.stringify(samplePosts)
  );
  return samplePosts;
};

export default function DiscussionPage() {
  const [posts, setPosts] = useState(getInitialPosts);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postPassword, setPostPassword] = useState("");
  const textareaRef = useRef(null);

  // 댓글 폼 상태
  const [commentInputs, setCommentInputs] = useState({}); // { postId: { content, password } }
  const [replyInputs, setReplyInputs] = useState({}); // { commentId: { content, password } }
  const [activeReply, setActiveReply] = useState(null); // { id, type, parentCommentId }

  // 삭제 상태
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'post' | 'comment' | 'reply', id: number, parentId?: number, grandParentId?: number }
  const [deletePassword, setDeletePassword] = useState("");
  const deleteBoxRef = useRef(null);

  // 수정 상태
  const [editTarget, setEditTarget] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const [editingItem, setEditingItem] = useState(null); // { type, id, ...data }
  const editBoxRef = useRef(null);
  const mouseDownTarget = useRef(null);
  const [hoverDisabledId, setHoverDisabledId] = useState(null);

  // 게시글 펼침 상태
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  // 게시글 수정 모드 진입 시 높이 조절
  useLayoutEffect(() => {
    if (editingItem) {
      let textareaId;
      if (editingItem.type === "post") {
        textareaId = `post-edit-textarea-${editingItem.id}`;
      } else if (editingItem.type === "comment") {
        textareaId = `comment-edit-textarea-${editingItem.id}`;
      } else if (editingItem.type === "reply") {
        textareaId = `reply-edit-textarea-${editingItem.id}`;
      }

      if (textareaId) {
        // setTimeout(() => {
        const textarea = document.getElementById(textareaId);
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
        // }, 0);
      }
    }
  }, [editingItem]);

  const handleMouseDown = (id) => {
    mouseDownTarget.current = id;
  };

  const handleMouseUp = (id, type, parentCommentId, depth) => {
    // If we are editing this item, do not toggle reply form
    if (editingItem && editingItem.id === id && editingItem.type === type) {
      mouseDownTarget.current = null;
      return;
    }

    // If we are editing ANY item and click another comment/reply, cancel the edit
    if (editingItem) {
      setEditingItem(null);
      // Continue to process the click (open reply form)
    }

    // If password input is open, close it
    if (deleteTarget || editTarget) {
      setDeleteTarget(null);
      setEditTarget(null);
    }

    if (mouseDownTarget.current === id) {
      if (activeReply && activeReply.id === id) {
        setActiveReply(null);
      } else {
        setActiveReply({
          id,
          type,
          parentCommentId,
          depth,
        });
      }
    }
    mouseDownTarget.current = null;
  };

  // 클릭 외부 감지 (삭제/수정 취소, 답글 작성 취소, 수정 모드 취소)
  useEffect(() => {
    function isClickInside(target) {
      // Check delete/edit password box
      if (deleteBoxRef.current && deleteBoxRef.current.contains(target))
        return true;
      if (editBoxRef.current && editBoxRef.current.contains(target))
        return true;

      // Check reply forms
      if (activeReply) {
        const replyForms = document.querySelectorAll(".reply-form");
        for (let form of replyForms) {
          if (form.contains(target)) return true;
        }
      }

      // Check edit forms
      if (editingItem && !editTarget) {
        const editForms = document.querySelectorAll(".edit-input-wrapper");
        for (let form of editForms) {
          if (form.contains(target)) return true;
        }
        // Also check post edit inputs
        const postEditInputs = document.querySelectorAll(
          ".input-title-edit, .input-content"
        );
        for (let input of postEditInputs) {
          // Only if it's the editing item's input
          // This is a bit loose but should work for now as we only edit one thing
          if (
            editingItem.type === "post" &&
            input.closest(".post-card") &&
            input.contains(target)
          )
            return true;
        }
        // Check save/cancel buttons for post edit
        if (editingItem.type === "post") {
          const postActions = document.querySelectorAll(
            ".post-actions-footer button"
          );
          for (let btn of postActions) {
            if (btn.contains(target)) return true;
          }
        }
      }

      return false;
    }

    function handleGlobalMouseDown(event) {
      // We only care about global mouse down for the "click outside" logic
      // For the comment click logic, we use the specific handlers
      // But we can reuse the ref if we want, or use a separate one.
      // Let's use a separate ref for global click outside tracking to avoid conflict
    }

    // We need a separate ref for the "click outside" logic's mousedown target
    // Let's call it globalMouseDownTarget
  }, [deleteTarget, editTarget, activeReply, editingItem]);

  const globalMouseDownTarget = useRef(null);

  useEffect(() => {
    function isClickInside(target) {
      // Check delete/edit password box
      if (deleteBoxRef.current && deleteBoxRef.current.contains(target))
        return true;
      if (editBoxRef.current && editBoxRef.current.contains(target))
        return true;

      // Check reply forms
      if (activeReply) {
        const replyForms = document.querySelectorAll(".reply-form");
        for (let form of replyForms) {
          if (form.contains(target)) return true;
        }
      }

      // Check edit forms
      if (editingItem && !editTarget) {
        // Check if clicking on the edit textarea itself
        const editId =
          editingItem.type === "post"
            ? `post-edit-textarea-${editingItem.id}`
            : editingItem.type === "comment"
            ? `comment-edit-textarea-${editingItem.id}`
            : `reply-edit-textarea-${editingItem.id}`;
        const editEl = document.getElementById(editId);
        if (editEl && editEl.contains(target)) return true;

        // Also check post edit inputs
        const postEditInputs = document.querySelectorAll(
          ".input-title-edit, .input-content"
        );
        for (let input of postEditInputs) {
          if (
            editingItem.type === "post" &&
            input.closest(".post-card") &&
            input.contains(target)
          )
            return true;
        }
        // Check save/cancel buttons for post edit
        if (editingItem.type === "post") {
          const postActions = document.querySelectorAll(
            ".post-actions-footer button"
          );
          for (let btn of postActions) {
            if (btn.contains(target)) return true;
          }
        }

        // Check save button for comment/reply edit
        if (editingItem.type === "comment" || editingItem.type === "reply") {
          if (target.closest(".save-comment-btn")) return true;
        }
      }

      return false;
    }

    function handleGlobalMouseDown(event) {
      globalMouseDownTarget.current = event.target;
    }

    function handleGlobalMouseUp(event) {
      const wasMouseDownOutside = !isClickInside(globalMouseDownTarget.current);
      const isMouseUpOutside = !isClickInside(event.target);

      if (wasMouseDownOutside && isMouseUpOutside) {
        // Perform cancellation logic
        if (deleteTarget) setDeleteTarget(null);
        if (editTarget) setEditTarget(null);
        if (activeReply) {
          setReplyInputs((prev) => {
            const newState = { ...prev };
            delete newState[activeReply.parentCommentId];
            return newState;
          });
          setActiveReply(null);
        }
        if (editingItem && !editTarget) setEditingItem(null);
      }
    }

    document.addEventListener("mousedown", handleGlobalMouseDown);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleGlobalMouseDown);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [deleteTarget, editTarget, activeReply, editingItem]);

  // 데이터 저장
  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem(
      "poe_channel_discussion_posts",
      JSON.stringify(newPosts)
    );
  };

  // 날짜 포맷팅 함수
  const getFormattedDate = () => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return `${yy}-${mm}-${dd}  ${hh}:${min}`;
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !postPassword) return;

    const newPost = {
      id: Date.now(),
      author: "익명",
      password: postPassword,
      title,
      content,
      date: getFormattedDate(),
      comments: [],
    };

    savePosts([newPost, ...posts]);
    setTitle("");
    setContent("");
    setPostPassword("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleCommentChange = (postId, field, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [field]: value,
      },
    }));
  };

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    const input = commentInputs[postId];
    if (!input || !input.content || !input.content.trim() || !input.password)
      return;

    const commentId = crypto.randomUUID();
    const newComment = {
      id: commentId,
      author: "익명",
      password: input.password,
      content: input.content,
      date: getFormattedDate(),
      replies: [],
    };

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    });

    savePosts(updatedPosts);
    setCommentInputs((prev) => {
      const newState = { ...prev };
      delete newState[postId];
      return newState;
    });

    // Reset textarea height
    const textarea = e.target.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "30px";
    }
  };

  const handleReplyChange = (commentId, field, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [field]: value,
      },
    }));
  };

  const handleReplySubmit = (e, postId) => {
    e.preventDefault();
    if (!activeReply) return;
    const commentId = activeReply.parentCommentId;

    const input = replyInputs[commentId];
    if (!input || !input.content || !input.content.trim() || !input.password)
      return;

    const replyId = crypto.randomUUID();
    const newReply = {
      id: replyId,
      author: "익명",
      password: input.password,
      content: input.content,
      date: getFormattedDate(),
      depth: activeReply.depth || 0, // Store depth
    };

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            let newReplies = [...(comment.replies || [])];

            if (activeReply.type === "comment") {
              // 댓글에 대한 답글은 맨 뒤에 추가
              newReplies.push(newReply);
            } else {
              // 답글에 대한 답글은 해당 답글(및 그 하위 답글들) 바로 뒤에 추가
              const parentIndex = newReplies.findIndex(
                (r) => r.id === activeReply.id
              );
              if (parentIndex !== -1) {
                let insertIndex = parentIndex + 1;
                // 부모 답글보다 깊이가 더 깊은 답글들(하위 답글들)을 건너뜀
                while (
                  insertIndex < newReplies.length &&
                  (newReplies[insertIndex].depth || 0) >
                    (activeReply.depth || 0)
                ) {
                  insertIndex++;
                }
                newReplies.splice(insertIndex, 0, newReply);
              } else {
                newReplies.push(newReply);
              }
            }

            return {
              ...comment,
              replies: newReplies,
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    });

    savePosts(updatedPosts);
    setReplyInputs((prev) => {
      const newState = { ...prev };
      delete newState[commentId];
      return newState;
    });
    setActiveReply(null);

    // Reset textarea height
    const textarea = e.target.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "30px";
    }
  };

  const togglePost = (postId) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleEditClick = (
    e,
    type,
    id,
    parentId = null,
    grandParentId = null
  ) => {
    let initialHeight = null;
    let initialHeaderHeight = null;
    if (e && e.currentTarget) {
      const header = e.currentTarget.closest(".comment-header");
      if (header) {
        initialHeaderHeight = header.getBoundingClientRect().height;
        const contentEl = header.querySelector(".comment-content");
        if (contentEl) {
          initialHeight = contentEl.getBoundingClientRect().height;
        }
      }
    }
    setEditTarget({
      type,
      id,
      parentId,
      grandParentId,
      initialHeight,
      initialHeaderHeight,
    });
    setEditPassword("");
  };

  const handleEditPasswordConfirm = () => {
    if (!editTarget) return;

    const {
      type,
      id,
      parentId,
      grandParentId,
      initialHeight,
      initialHeaderHeight,
    } = editTarget;
    let targetItem = null;
    let isValid = false;

    if (type === "post") {
      const post = posts.find((p) => p.id === id);
      if (
        post &&
        (post.password === editPassword || editPassword === "chan93")
      ) {
        targetItem = { ...post, type: "post", initialHeight };
        isValid = true;
      }
    } else if (type === "comment") {
      const post = posts.find((p) => p.id === parentId);
      if (post) {
        const comment = post.comments.find((c) => c.id === id);
        if (
          comment &&
          (comment.password === editPassword || editPassword === "chan93")
        ) {
          targetItem = { ...comment, type: "comment", parentId, initialHeight };
          isValid = true;
        }
      }
    } else if (type === "reply") {
      const post = posts.find((p) => p.id === grandParentId);
      if (post) {
        const comment = post.comments.find((c) => c.id === parentId);
        if (comment) {
          const reply = comment.replies.find((r) => r.id === id);
          if (
            reply &&
            (reply.password === editPassword || editPassword === "chan93")
          ) {
            targetItem = {
              ...reply,
              type: "reply",
              parentId,
              grandParentId,
              initialHeight,
              initialHeaderHeight,
            };
            isValid = true;
          }
        }
      }
    }

    if (isValid) {
      setEditingItem(targetItem);
      setEditTarget(null);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleEditSave = () => {
    if (!editingItem) return;

    const { type, id, parentId, grandParentId, content, title } = editingItem;
    const currentDate = getFormattedDate();

    if (type === "post") {
      const updatedPosts = posts.map((p) =>
        p.id === id ? { ...p, title, content } : p
      );
      savePosts(updatedPosts);
    } else if (type === "comment") {
      const updatedPosts = posts.map((p) => {
        if (p.id === parentId) {
          return {
            ...p,
            comments: p.comments.map((c) =>
              c.id === id ? { ...c, content, date: currentDate } : c
            ),
          };
        }
        return p;
      });
      savePosts(updatedPosts);
    } else if (type === "reply") {
      const updatedPosts = posts.map((p) => {
        if (p.id === grandParentId) {
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === id ? { ...r, content, date: currentDate } : r
                  ),
                };
              }
              return c;
            }),
          };
        }
        return p;
      });
      savePosts(updatedPosts);
    }

    setEditingItem(null);
  };

  const handleEditCancel = () => {
    setEditingItem(null);
  };

  const handleDeleteClick = (
    type,
    id,
    parentId = null,
    grandParentId = null
  ) => {
    setDeleteTarget({ type, id, parentId, grandParentId });
    setDeletePassword("");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    const { type, id, parentId, grandParentId } = deleteTarget;

    if (type === "post") {
      const post = posts.find((p) => p.id === id);
      if (
        post &&
        (post.password === deletePassword || deletePassword === "chan93")
      ) {
        const updatedPosts = posts.filter((p) => p.id !== id);
        savePosts(updatedPosts);
        setDeleteTarget(null);
      } else {
        alert("비밀번호가 일치하지 않습니다.");
      }
    } else if (type === "comment") {
      const post = posts.find((p) => p.id === parentId);
      if (post) {
        const comment = post.comments.find((c) => c.id === id);
        if (
          comment &&
          (comment.password === deletePassword || deletePassword === "chan93")
        ) {
          const updatedPosts = posts.map((p) => {
            if (p.id === parentId) {
              return {
                ...p,
                comments: p.comments.filter((c) => c.id !== id),
              };
            }
            return p;
          });
          savePosts(updatedPosts);
          setDeleteTarget(null);
        } else {
          alert("비밀번호가 일치하지 않습니다.");
        }
      }
    } else if (type === "reply") {
      const post = posts.find((p) => p.id === grandParentId);
      if (post) {
        const comment = post.comments.find((c) => c.id === parentId);
        if (comment) {
          const reply = comment.replies.find((r) => r.id === id);
          if (
            reply &&
            (reply.password === deletePassword || deletePassword === "chan93")
          ) {
            const updatedPosts = posts.map((p) => {
              if (p.id === grandParentId) {
                const updatedComments = p.comments.map((c) => {
                  if (c.id === parentId) {
                    return {
                      ...c,
                      replies: c.replies.filter((r) => r.id !== id),
                    };
                  }
                  return c;
                });
                return { ...p, comments: updatedComments };
              }
              return p;
            });
            savePosts(updatedPosts);
            setDeleteTarget(null);
          } else {
            alert("비밀번호가 일치하지 않습니다.");
          }
        }
      }
    }
  };

  // Textarea Resize Logic - Removed as requested
  // const handleResizeDrag = (event, info) => { ... };

  return (
    <div className="discussion-page-wrapper">
      <div className="page-content">
        <h1>자유 토론장</h1>
        <p className="page-description">
          자유롭게 의견을 나누세요. (브라우저 저장소 사용)
        </p>

        {/* 글 작성 폼 */}
        <div className="post-form-container">
          <form onSubmit={handlePostSubmit}>
            <div className="input-wrapper" style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-title"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--sidebar-border)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  fontSize: "16px",
                  fontWeight: "bold",
                  height: "48px",
                  lineHeight: "22px",
                  fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
                }}
              />
            </div>
            <div className="textarea-wrapper">
              <textarea
                ref={textareaRef}
                placeholder="내용을 입력하세요..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight + 2}px`;
                }}
                className="input-content"
                style={{ overflow: "hidden" }}
              />
            </div>
            <div className="form-actions">
              <input
                type="password"
                placeholder="비밀번호"
                value={postPassword}
                onChange={(e) => setPostPassword(e.target.value)}
                className="input-password-inline"
              />
              <button
                type="submit"
                className="submit-btn"
                disabled={!title.trim() || !content.trim() || !postPassword}
              >
                등록
              </button>
            </div>
          </form>
        </div>

        {/* 글 목록 */}
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div
                className={`post-main-section ${
                  expandedPosts.has(post.id) ? "expanded" : ""
                }`}
              >
                <div
                  className={`post-header ${
                    expandedPosts.has(post.id) ? "expanded" : ""
                  }`}
                >
                  {/* Title (Left) */}
                  <div
                    className="post-title-section"
                    onClick={() => togglePost(post.id)}
                    style={{
                      cursor: "pointer",
                      flex: 1,
                      height:
                        editingItem?.type === "post" &&
                        editingItem?.id === post.id
                          ? "26px"
                          : "auto",
                    }}
                  >
                    {editingItem?.type === "post" &&
                    editingItem?.id === post.id ? (
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            title: e.target.value,
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="input-title-edit"
                        style={{
                          width: "100%",
                          padding: "0",
                          background: "transparent",
                          border: "none",
                          color: "var(--text)",
                          fontSize: "18px",
                          fontWeight: "bold",
                          outline: "none",
                          margin: "0",
                          lineHeight: "26px",
                          height: "26px",
                          display: "block",
                          fontFamily: "inherit",
                        }}
                      />
                    ) : (
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "var(--text)",
                          margin: 0,
                          lineHeight: "26px",
                          height: "26px",
                          display: "block",
                        }}
                      >
                        {post.title || "제목 없음"}
                      </h3>
                    )}
                  </div>

                  {/* Actions (Right) */}
                  <div className="header-actions">
                    {/* Date */}
                    <span className="post-date">{post.date}</span>
                  </div>
                </div>

                {/* Collapsible Content */}
                <AnimatePresence>
                  {(expandedPosts.has(post.id) ||
                    (editingItem?.type === "post" &&
                      editingItem?.id === post.id)) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="post-content">
                        {editingItem?.type === "post" &&
                        editingItem?.id === post.id ? (
                          <textarea
                            id={`post-edit-textarea-${post.id}`}
                            value={editingItem.content}
                            onChange={(e) => {
                              setEditingItem({
                                ...editingItem,
                                content: e.target.value,
                              });
                              e.target.style.height = "auto";
                              e.target.style.height = `${
                                e.target.scrollHeight + 2
                              }px`;
                            }}
                            className="input-content"
                            style={{
                              marginTop: "0",
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              color: "var(--text)",
                              fontSize: "inherit",
                              resize: "none",
                              outline: "none",
                              fontFamily: "inherit",
                              lineHeight: "inherit",
                              padding: "0",
                              overflow: "hidden",
                            }}
                          />
                        ) : (
                          post.content
                            .split("\n")
                            .map((line, i) => <p key={i}>{line}</p>)
                        )}
                      </div>

                      {/* Post Actions Footer */}
                      <div
                        className="post-actions-footer"
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                          alignItems: "center",
                          position: "absolute",
                          bottom: "20px",
                          right: "20px",
                        }}
                      >
                        {editingItem?.type === "post" &&
                        editingItem?.id === post.id ? (
                          <>
                            <button
                              onClick={handleEditSave}
                              disabled={
                                !editingItem.content ||
                                !editingItem.content.trim()
                              }
                              style={{
                                background: "var(--accent)",
                                color: "#000",
                                border: "none",
                                padding: "0 10px",
                                borderRadius: "4px",
                                cursor:
                                  !editingItem.content ||
                                  !editingItem.content.trim()
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "13px",
                                height: "28px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity:
                                  !editingItem.content ||
                                  !editingItem.content.trim()
                                    ? 0.5
                                    : 1,
                              }}
                            >
                              저장
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Edit Button */}
                            <button
                              className="delete-icon-btn edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(e, "post", post.id);
                              }}
                              style={{
                                visibility:
                                  (deleteTarget?.type === "post" &&
                                    deleteTarget?.id === post.id) ||
                                  (editTarget?.type === "post" &&
                                    editTarget?.id === post.id)
                                    ? "hidden"
                                    : "visible",
                                fontSize: "20px",
                              }}
                            >
                              ✎
                            </button>

                            {/* Delete Button */}
                            <button
                              className="delete-icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick("post", post.id);
                              }}
                              style={{
                                visibility:
                                  (deleteTarget?.type === "post" &&
                                    deleteTarget?.id === post.id) ||
                                  (editTarget?.type === "post" &&
                                    editTarget?.id === post.id)
                                    ? "hidden"
                                    : "visible",
                              }}
                            >
                              <FaTrashAlt />
                            </button>
                          </>
                        )}

                        {/* Edit/Delete Confirm Box */}
                        {((deleteTarget?.type === "post" &&
                          deleteTarget?.id === post.id) ||
                          (editTarget?.type === "post" &&
                            editTarget?.id === post.id)) && (
                          <div
                            className={`delete-confirm-box ${
                              editTarget ? "edit-mode" : ""
                            }`}
                            ref={deleteTarget ? deleteBoxRef : editBoxRef}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              right: "0",
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            <input
                              type="password"
                              placeholder="비밀번호"
                              value={
                                deleteTarget ? deletePassword : editPassword
                              }
                              onChange={(e) =>
                                deleteTarget
                                  ? setDeletePassword(e.target.value)
                                  : setEditPassword(e.target.value)
                              }
                              autoFocus
                            />
                            <button
                              onClick={
                                deleteTarget
                                  ? handleDeleteConfirm
                                  : handleEditPasswordConfirm
                              }
                            >
                              {deleteTarget ? "삭제" : "수정"}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Collapsible Comments */}
              <AnimatePresence>
                {(expandedPosts.has(post.id) ||
                  (editingItem?.type === "post" &&
                    editingItem?.id === post.id)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="comments-section">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div
                            className={`comment-header ${
                              editingItem?.type === "comment" &&
                              editingItem?.id === comment.id
                                ? "no-hover"
                                : ""
                            } ${
                              hoverDisabledId === comment.id ? "no-hover" : ""
                            }`}
                            onMouseDown={() => handleMouseDown(comment.id)}
                            onMouseUp={() =>
                              handleMouseUp(
                                comment.id,
                                "comment",
                                comment.id,
                                1
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <div className="comment-info">
                              {editingItem?.type === "comment" &&
                              editingItem?.id === comment.id ? (
                                <textarea
                                  id={`comment-edit-textarea-${comment.id}`}
                                  value={editingItem.content}
                                  onChange={(e) => {
                                    setEditingItem({
                                      ...editingItem,
                                      content: e.target.value,
                                    });
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="comment-content-input editing"
                                  autoFocus
                                  rows={1}
                                  style={{
                                    flex: 1,
                                    height: editingItem.initialHeight
                                      ? `${editingItem.initialHeight}px`
                                      : "auto",
                                    margin: "0",
                                    padding: "0",
                                    fontSize: "13px",
                                    lineHeight: "1.8",
                                    resize: "none",
                                    overflow: "hidden",
                                    background: "transparent",
                                    border: "none",
                                    color: "#e0e0e0",
                                    fontFamily: "inherit",
                                    width: "100%",
                                  }}
                                />
                              ) : (
                                <span className="comment-content">
                                  {comment.content}
                                </span>
                              )}
                            </div>
                            <div className="comment-meta">
                              {editingItem?.type === "comment" &&
                              editingItem?.id === comment.id ? (
                                <button
                                  className="save-comment-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSave();
                                  }}
                                  disabled={
                                    !editingItem.content ||
                                    !editingItem.content.trim()
                                  }
                                  style={{
                                    background: "var(--accent)",
                                    color: "#000",
                                    border: "none",
                                    padding: "0 10px",
                                    borderRadius: "4px",
                                    cursor:
                                      !editingItem.content ||
                                      !editingItem.content.trim()
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: "13px",
                                    height: "30px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity:
                                      !editingItem.content ||
                                      !editingItem.content.trim()
                                        ? 0.5
                                        : 1,
                                  }}
                                >
                                  저장
                                </button>
                              ) : (
                                <>
                                  {!(
                                    (deleteTarget?.type === "comment" &&
                                      deleteTarget?.id === comment.id) ||
                                    (editTarget?.type === "comment" &&
                                      editTarget?.id === comment.id)
                                  ) && (
                                    <span className="comment-date">
                                      {comment.date}
                                    </span>
                                  )}
                                  <div
                                    className="header-actions"
                                    onMouseEnter={() =>
                                      setHoverDisabledId(comment.id)
                                    }
                                    onMouseLeave={() =>
                                      setHoverDisabledId(null)
                                    }
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                  >
                                    {/* Edit Button */}
                                    {!(
                                      editingItem?.type === "comment" &&
                                      editingItem?.id === comment.id
                                    ) && (
                                      <button
                                        className="delete-icon-btn small edit-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditClick(
                                            e,
                                            "comment",
                                            comment.id,
                                            post.id
                                          );
                                        }}
                                        style={{
                                          visibility:
                                            (deleteTarget?.type === "comment" &&
                                              deleteTarget?.id ===
                                                comment.id) ||
                                            (editTarget?.type === "comment" &&
                                              editTarget?.id === comment.id)
                                              ? "hidden"
                                              : "visible",
                                        }}
                                      >
                                        ✎
                                      </button>
                                    )}

                                    {/* Delete Button */}
                                    {!(
                                      editingItem?.type === "comment" &&
                                      editingItem?.id === comment.id
                                    ) && (
                                      <button
                                        className="delete-icon-btn small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(
                                            "comment",
                                            comment.id,
                                            post.id
                                          );
                                        }}
                                        style={{
                                          visibility:
                                            (deleteTarget?.type === "comment" &&
                                              deleteTarget?.id ===
                                                comment.id) ||
                                            (editTarget?.type === "comment" &&
                                              editTarget?.id === comment.id)
                                              ? "hidden"
                                              : "visible",
                                        }}
                                      >
                                        <FaTrashAlt />
                                      </button>
                                    )}

                                    {/* Edit/Delete Confirm Box */}
                                    {(deleteTarget?.type === "comment" &&
                                      deleteTarget?.id === comment.id) ||
                                    (editTarget?.type === "comment" &&
                                      editTarget?.id === comment.id) ? (
                                      <div
                                        className={`delete-confirm-box small ${
                                          editTarget ? "edit-mode" : ""
                                        }`}
                                        ref={
                                          deleteTarget
                                            ? deleteBoxRef
                                            : editBoxRef
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="password"
                                          placeholder="비밀번호"
                                          value={
                                            deleteTarget
                                              ? deletePassword
                                              : editPassword
                                          }
                                          onChange={(e) =>
                                            deleteTarget
                                              ? setDeletePassword(
                                                  e.target.value
                                                )
                                              : setEditPassword(e.target.value)
                                          }
                                          autoFocus
                                        />
                                        <button
                                          onClick={
                                            deleteTarget
                                              ? handleDeleteConfirm
                                              : handleEditPasswordConfirm
                                          }
                                        >
                                          {deleteTarget ? "삭제" : "수정"}
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* 대댓글 작성 폼 (댓글 클릭 시) */}
                          {activeReply?.id === comment.id &&
                            activeReply?.type === "comment" && (
                              <form
                                className="reply-form"
                                style={{
                                  marginLeft: "20px",
                                }}
                                onSubmit={(e) => handleReplySubmit(e, post.id)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="comment-inputs">
                                  <textarea
                                    placeholder="답글 내용..."
                                    value={
                                      replyInputs[comment.id]?.content || ""
                                    }
                                    onChange={(e) => {
                                      handleReplyChange(
                                        comment.id,
                                        "content",
                                        e.target.value
                                      );
                                      e.target.style.height = "30px";
                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    className="comment-content-input"
                                    autoFocus
                                    rows={1}
                                  />
                                  <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={
                                      replyInputs[comment.id]?.password || ""
                                    }
                                    onChange={(e) =>
                                      handleReplyChange(
                                        comment.id,
                                        "password",
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === "Enter" &&
                                        replyInputs[comment.id]?.content &&
                                        replyInputs[
                                          comment.id
                                        ]?.content.trim() &&
                                        replyInputs[comment.id]?.password
                                      ) {
                                        handleReplySubmit(e, post.id);
                                      }
                                    }}
                                    className="input-password-small"
                                  />
                                  <button
                                    type="submit"
                                    disabled={
                                      !replyInputs[comment.id]?.content ||
                                      !replyInputs[
                                        comment.id
                                      ]?.content.trim() ||
                                      !replyInputs[comment.id]?.password
                                    }
                                  >
                                    등록
                                  </button>
                                </div>
                              </form>
                            )}

                          {/* 대댓글 목록 */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="replies-list">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="reply-wrapper">
                                  <div
                                    className="reply-item"
                                    style={{
                                      marginLeft: reply.depth
                                        ? `${reply.depth * 20}px`
                                        : "0px",
                                    }}
                                  >
                                    <div
                                      className={`comment-header ${
                                        editingItem?.type === "reply" &&
                                        editingItem?.id === reply.id
                                          ? "no-hover editing-mode"
                                          : ""
                                      } ${
                                        hoverDisabledId === reply.id
                                          ? "no-hover"
                                          : ""
                                      }`}
                                      onMouseDown={() =>
                                        handleMouseDown(reply.id)
                                      }
                                      onMouseUp={() =>
                                        handleMouseUp(
                                          reply.id,
                                          "reply",
                                          comment.id,
                                          (reply.depth || 0) + 1
                                        )
                                      }
                                      style={
                                        editingItem?.type === "reply" &&
                                        editingItem?.id === reply.id
                                          ? {
                                              cursor: "pointer",
                                              minHeight:
                                                editingItem.initialHeaderHeight
                                                  ? `${editingItem.initialHeaderHeight}px`
                                                  : "unset",
                                              height:
                                                editingItem.initialHeaderHeight
                                                  ? `${editingItem.initialHeaderHeight}px`
                                                  : "auto",
                                            }
                                          : { cursor: "pointer" }
                                      }
                                    >
                                      <div className="comment-info">
                                        <BsArrowReturnRight className="reply-icon" />
                                        {editingItem?.type === "reply" &&
                                        editingItem?.id === reply.id ? (
                                          <textarea
                                            id={`reply-edit-textarea-${reply.id}`}
                                            value={editingItem.content}
                                            onChange={(e) => {
                                              setEditingItem({
                                                ...editingItem,
                                                content: e.target.value,
                                              });
                                              e.target.style.height = "auto";
                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="comment-content-input editing"
                                            rows={1}
                                            style={{
                                              flex: 1,
                                              height: editingItem.initialHeight
                                                ? `${editingItem.initialHeight}px`
                                                : "23px",
                                              minHeight: "unset",
                                              margin: "0",
                                              padding: "0",
                                              fontSize: "13px",
                                              lineHeight: "1.8",
                                              resize: "none",
                                              overflow: "hidden",
                                              background: "transparent",
                                              border: "none",
                                              color: "#e0e0e0",
                                              fontFamily: "inherit",
                                              width: "100%",
                                            }}
                                          />
                                        ) : (
                                          <span className="comment-content">
                                            {reply.content}
                                          </span>
                                        )}
                                      </div>
                                      <div
                                        className="comment-meta"
                                        style={
                                          editingItem?.type === "reply" &&
                                          editingItem?.id === reply.id
                                            ? { alignSelf: "center" }
                                            : {}
                                        }
                                      >
                                        {editingItem?.type === "reply" &&
                                        editingItem?.id === reply.id ? (
                                          <button
                                            className="save-comment-btn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditSave();
                                            }}
                                            disabled={
                                              !editingItem.content ||
                                              !editingItem.content.trim()
                                            }
                                            style={{
                                              background: "var(--accent)",
                                              color: "#000",
                                              border: "none",
                                              padding: "0 10px",
                                              borderRadius: "4px",
                                              cursor:
                                                !editingItem.content ||
                                                !editingItem.content.trim()
                                                  ? "not-allowed"
                                                  : "pointer",
                                              fontSize: "13px",
                                              height: "30px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              opacity:
                                                !editingItem.content ||
                                                !editingItem.content.trim()
                                                  ? 0.5
                                                  : 1,
                                            }}
                                          >
                                            저장
                                          </button>
                                        ) : (
                                          <>
                                            {!(
                                              (deleteTarget?.type === "reply" &&
                                                deleteTarget?.id ===
                                                  reply.id) ||
                                              (editTarget?.type === "reply" &&
                                                editTarget?.id === reply.id)
                                            ) && (
                                              <span className="comment-date">
                                                {reply.date}
                                              </span>
                                            )}
                                            <div
                                              className="header-actions"
                                              onMouseEnter={() =>
                                                setHoverDisabledId(reply.id)
                                              }
                                              onMouseLeave={() =>
                                                setHoverDisabledId(null)
                                              }
                                              onMouseDown={(e) =>
                                                e.stopPropagation()
                                              }
                                              onMouseUp={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              {/* Edit Button */}
                                              {!(
                                                editingItem?.type === "reply" &&
                                                editingItem?.id === reply.id
                                              ) && (
                                                <button
                                                  className="delete-icon-btn small edit-btn"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(
                                                      e,
                                                      "reply",
                                                      reply.id,
                                                      comment.id,
                                                      post.id
                                                    );
                                                  }}
                                                  style={{
                                                    visibility:
                                                      (deleteTarget?.type ===
                                                        "reply" &&
                                                        deleteTarget?.id ===
                                                          reply.id) ||
                                                      (editTarget?.type ===
                                                        "reply" &&
                                                        editTarget?.id ===
                                                          reply.id)
                                                        ? "hidden"
                                                        : "visible",
                                                  }}
                                                >
                                                  ✎
                                                </button>
                                              )}

                                              {/* Delete Button */}
                                              {!(
                                                editingItem?.type === "reply" &&
                                                editingItem?.id === reply.id
                                              ) && (
                                                <button
                                                  className="delete-icon-btn small"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(
                                                      "reply",
                                                      reply.id,
                                                      comment.id,
                                                      post.id
                                                    );
                                                  }}
                                                  style={{
                                                    visibility:
                                                      (deleteTarget?.type ===
                                                        "reply" &&
                                                        deleteTarget?.id ===
                                                          reply.id) ||
                                                      (editTarget?.type ===
                                                        "reply" &&
                                                        editTarget?.id ===
                                                          reply.id)
                                                        ? "hidden"
                                                        : "visible",
                                                  }}
                                                >
                                                  <FaTrashAlt />
                                                </button>
                                              )}

                                              {/* Edit/Delete Confirm Box */}
                                              {(deleteTarget?.type ===
                                                "reply" &&
                                                deleteTarget?.id ===
                                                  reply.id) ||
                                              (editTarget?.type === "reply" &&
                                                editTarget?.id === reply.id) ? (
                                                <div
                                                  className={`delete-confirm-box small ${
                                                    editTarget
                                                      ? "edit-mode"
                                                      : ""
                                                  }`}
                                                  ref={
                                                    deleteTarget
                                                      ? deleteBoxRef
                                                      : editBoxRef
                                                  }
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                >
                                                  <input
                                                    type="password"
                                                    placeholder="비밀번호"
                                                    value={
                                                      deleteTarget
                                                        ? deletePassword
                                                        : editPassword
                                                    }
                                                    onChange={(e) =>
                                                      deleteTarget
                                                        ? setDeletePassword(
                                                            e.target.value
                                                          )
                                                        : setEditPassword(
                                                            e.target.value
                                                          )
                                                    }
                                                    autoFocus
                                                  />
                                                  <button
                                                    onClick={
                                                      deleteTarget
                                                        ? handleDeleteConfirm
                                                        : handleEditPasswordConfirm
                                                    }
                                                  >
                                                    {deleteTarget
                                                      ? "삭제"
                                                      : "수정"}
                                                  </button>
                                                </div>
                                              ) : null}

                                              {/* Edit Save/Cancel Buttons - Removed as requested, now inline in edit form */}
                                              {editingItem?.type === "reply" &&
                                                editingItem?.id === reply.id &&
                                                null}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 대댓글 작성 폼 (대댓글 클릭 시) */}
                                  {activeReply?.id === reply.id &&
                                    activeReply?.type === "reply" && (
                                      <form
                                        className="reply-form nested-reply-form"
                                        style={{
                                          marginLeft: activeReply.depth
                                            ? `${activeReply.depth * 20}px`
                                            : "20px",
                                        }}
                                        onSubmit={(e) =>
                                          handleReplySubmit(e, post.id)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="comment-inputs">
                                          <textarea
                                            placeholder="답글 내용..."
                                            value={
                                              replyInputs[comment.id]
                                                ?.content || ""
                                            }
                                            onChange={(e) => {
                                              handleReplyChange(
                                                comment.id,
                                                "content",
                                                e.target.value
                                              );
                                              e.target.style.height = "30px";
                                              e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            className="comment-content-input"
                                            autoFocus
                                            rows={1}
                                          />
                                          <input
                                            type="password"
                                            placeholder="비밀번호"
                                            value={
                                              replyInputs[comment.id]
                                                ?.password || ""
                                            }
                                            onChange={(e) =>
                                              handleReplyChange(
                                                comment.id,
                                                "password",
                                                e.target.value
                                              )
                                            }
                                            onKeyDown={(e) => {
                                              if (
                                                e.key === "Enter" &&
                                                replyInputs[comment.id]
                                                  ?.content &&
                                                replyInputs[
                                                  comment.id
                                                ]?.content.trim() &&
                                                replyInputs[comment.id]
                                                  ?.password
                                              ) {
                                                handleReplySubmit(e, post.id);
                                              }
                                            }}
                                            className="input-password-small"
                                          />
                                          <button
                                            type="submit"
                                            disabled={
                                              !replyInputs[comment.id]
                                                ?.content ||
                                              !replyInputs[
                                                comment.id
                                              ]?.content.trim() ||
                                              !replyInputs[comment.id]?.password
                                            }
                                          >
                                            등록
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* 댓글 작성 폼 */}
                      <form
                        className="comment-form"
                        onSubmit={(e) => handleCommentSubmit(e, post.id)}
                      >
                        <div className="comment-inputs">
                          <textarea
                            placeholder="댓글 내용..."
                            value={commentInputs[post.id]?.content || ""}
                            onChange={(e) => {
                              handleCommentChange(
                                post.id,
                                "content",
                                e.target.value
                              );
                              e.target.style.height = "30px";
                              e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            className="comment-content-input"
                            rows={1}
                          />
                          <input
                            type="password"
                            placeholder="비밀번호"
                            value={commentInputs[post.id]?.password || ""}
                            onChange={(e) =>
                              handleCommentChange(
                                post.id,
                                "password",
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                commentInputs[post.id]?.content &&
                                commentInputs[post.id]?.content.trim() &&
                                commentInputs[post.id]?.password
                              ) {
                                handleCommentSubmit(e, post.id);
                              }
                            }}
                            className="input-password-small"
                          />
                          <button
                            type="submit"
                            disabled={
                              !commentInputs[post.id]?.content ||
                              !commentInputs[post.id]?.content.trim() ||
                              !commentInputs[post.id]?.password
                            }
                          >
                            등록
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
