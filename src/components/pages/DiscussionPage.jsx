"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { BsArrowReturnRight } from "react-icons/bs";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import "../../styles/DiscussionPage.css";
import { formatDate, validatePassword, generateId } from "../../utils";

/**
 * 게시글 데이터 구조:
 * - id: 고유 ID
 * - title: 제목
 * - author: 작성자 (익명)
 * - password: 비밀번호
 * - content: 내용
 * - date: 작성일
 * - comments: 댓글 배열
 */

export default function DiscussionPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 비밀번호 오류 상태
  const [passwordError, setPasswordError] = useState(false);

  // 게시글 펼침 상태
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10;

  // 페이지네이션 계산
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: "smooth" });
    // 펼쳐진 게시글 초기화
    setExpandedPosts(new Set());
  };

  // 서버에서 게시글 로드
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/posts");
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

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

    // If we are editing ANY comment/reply, do not open reply form for any item
    if (
      editingItem &&
      (editingItem.type === "comment" || editingItem.type === "reply")
    ) {
      mouseDownTarget.current = null;
      return;
    }

    // If we are editing ANY item and click another comment/reply, cancel the edit
    if (editingItem) {
      setEditingItem(null);
      // Continue to process the click (open reply form)
    }

    // If password input is open, do not process this click at all
    // (clicking on comment area should not close password input - it's handled by global click)
    if (deleteTarget || editTarget) {
      mouseDownTarget.current = null;
      return;
    }

    if (mouseDownTarget.current === id) {
      // 텍스트 선택(드래그) 중이면 입력칸을 표시하지 않음
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        mouseDownTarget.current = null;
        return;
      }

      if (activeReply && activeReply.id === id) {
        setActiveReply(null);
      } else {
        // 기존 입력 초기화 (7번 요구사항)
        if (activeReply && activeReply.parentCommentId) {
          setReplyInputs((prev) => {
            const newState = { ...prev };
            delete newState[activeReply.parentCommentId];
            return newState;
          });
        }
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

  const globalMouseDownTarget = useRef(null);

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

      // 클릭 시 텍스트 선택 해제 (드래그 취소)
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // 선택된 텍스트 영역 내부를 클릭한 경우는 선택 유지
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const isClickInsideSelection =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!isClickInsideSelection) {
          selection.removeAllRanges();
        }
      }
    }

    function handleGlobalMouseUp(event) {
      // 텍스트 선택(드래그) 중이면 취소 로직 실행 안함
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

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

  // 데이터 저장 (서버 API 호출)
  const savePosts = async (action, data) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const result = await res.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setPosts(result.posts);
      return true;
    } catch (err) {
      console.error("Failed to save:", err);
      setError("저장에 실패했습니다.");
      return false;
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !postPassword) return;

    await savePosts("create_post", {
      password: postPassword,
      title,
      content,
      date: formatDate(),
    });

    setTitle("");
    setContent("");
    setPostPassword("");
    setCurrentPage(1); // 새 글 작성 후 첫 페이지로 이동
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

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const input = commentInputs[postId];
    if (!input || !input.content || !input.content.trim() || !input.password)
      return;

    const commentId = crypto.randomUUID();

    await savePosts("create_comment", {
      postId,
      commentId,
      password: input.password,
      content: input.content,
      date: formatDate(),
    });

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

  const handleReplySubmit = async (e, postId) => {
    e.preventDefault();
    if (!activeReply) return;
    const commentId = activeReply.parentCommentId;

    const input = replyInputs[commentId];
    if (!input || !input.content || !input.content.trim() || !input.password)
      return;

    const replyId = crypto.randomUUID();
    const replyDepth =
      activeReply.type === "comment" ? 0 : (activeReply.depth || 0) + 1;

    await savePosts("create_reply", {
      postId,
      commentId,
      replyId,
      password: input.password,
      content: input.content,
      date: formatDate(),
      depth: replyDepth,
      parentReplyId: activeReply.type === "reply" ? activeReply.id : null,
    });

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
    setPasswordError(false);
  };

  const handleEditPasswordConfirm = async () => {
    if (!editTarget) return;

    const {
      type,
      id,
      parentId,
      grandParentId,
      initialHeight,
      initialHeaderHeight,
    } = editTarget;

    // 비밀번호 검증
    try {
      const res = await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, password: editPassword }),
      });
      const result = await res.json();

      if (!result.valid) {
        setPasswordError(true);
        setTimeout(() => setPasswordError(false), 2000);
        return;
      }

      // 수정 모드 진입
      let targetItem = null;
      if (type === "post") {
        const post = posts.find((p) => p.id === id);
        if (post) {
          targetItem = { ...post, type: "post", initialHeight };
        }
      } else if (type === "comment") {
        const post = posts.find((p) => p.id === parentId);
        if (post) {
          const comment = post.comments.find((c) => c.id === id);
          if (comment) {
            targetItem = {
              ...comment,
              type: "comment",
              parentId,
              initialHeight,
            };
          }
        }
      } else if (type === "reply") {
        const post = posts.find((p) => p.id === grandParentId);
        if (post) {
          const comment = post.comments.find((c) => c.id === parentId);
          if (comment) {
            const reply = comment.replies.find((r) => r.id === id);
            if (reply) {
              targetItem = {
                ...reply,
                type: "reply",
                parentId,
                grandParentId,
                initialHeight,
                initialHeaderHeight,
              };
            }
          }
        }
      }

      if (targetItem) {
        setEditingItem(targetItem);
        setEditTarget(null);
        setPasswordError(false);
      }
    } catch (err) {
      console.error("Edit password check failed:", err);
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleEditSave = async () => {
    if (!editingItem) return;

    const { type, id, parentId, grandParentId, content, title } = editingItem;

    if (type === "post") {
      await savePosts("update_post", { id, title, content });
    } else if (type === "comment") {
      await savePosts("update_comment", { id, content });
    } else if (type === "reply") {
      await savePosts("update_reply", { id, content });
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
    setPasswordError(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const { type, id, parentId, grandParentId } = deleteTarget;

    // 비밀번호 검증
    try {
      const res = await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, password: deletePassword }),
      });
      const result = await res.json();

      if (!result.valid) {
        setPasswordError(true);
        setTimeout(() => setPasswordError(false), 2000);
        return;
      }

      // 삭제 실행
      if (type === "post") {
        await savePosts("delete_post", { id });
      } else if (type === "comment") {
        await savePosts("delete_comment", { id });
      } else if (type === "reply") {
        await savePosts("delete_reply", { id });
      }

      setDeleteTarget(null);
      setPasswordError(false);
    } catch (err) {
      console.error("Delete failed:", err);
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  // Textarea Resize Logic - Removed as requested
  // const handleResizeDrag = (event, info) => { ... };

  if (isLoading) {
    return (
      <div className="discussion-page-wrapper">
        <div className="page-content">
          <h1>자유 토론장</h1>
          <p className="page-description">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="discussion-page-wrapper">
        <div className="page-content">
          <h1>자유 토론장</h1>
          <p className="page-description" style={{ color: "#ff6b6b" }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "var(--accent)",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              color: "white",
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="discussion-page-wrapper">
      <div className="page-content">
        <h1>자유 토론장</h1>
        <p className="page-description">
          자유 토론장에 오신 것을 환영합니다! 자유롭게 의견을 나누고 정보를
          공유해보세요.
        </p>

        {/* 글 작성 폼 */}
        <div className="post-form-container">
          <form onSubmit={handlePostSubmit}>
            <div className="input-wrapper" style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="게시글 제목"
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
                placeholder="게시글 내용"
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
          {currentPosts.map((post) => (
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
                    onClick={(e) => {
                      // 텍스트 선택(드래그) 중이면 접힘 방지
                      const selection = window.getSelection();
                      if (selection && selection.toString().trim().length > 0) {
                        return;
                      }
                      togglePost(post.id);
                    }}
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
                              minHeight: "unset",
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
                            {passwordError && (
                              <span className="password-error-message">
                                비밀번호가 일치하지 않습니다
                              </span>
                            )}
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
                              disabled={
                                deleteTarget
                                  ? !deletePassword.trim()
                                  : !editPassword.trim()
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
                      {post.comments.map((comment) => {
                        const isCommentMultiLine =
                          comment.content && comment.content.includes("\n");
                        return (
                          <div key={comment.id} className="comment-item">
                            <div
                              className={`comment-header ${
                                editingItem?.type === "comment" &&
                                editingItem?.id === comment.id
                                  ? "no-hover"
                                  : ""
                              } ${
                                hoverDisabledId === comment.id ? "no-hover" : ""
                              } ${isCommentMultiLine ? "multi-line" : ""}`}
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
                                              (deleteTarget?.type ===
                                                "comment" &&
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
                                              (deleteTarget?.type ===
                                                "comment" &&
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
                                          {passwordError && (
                                            <span className="password-error-message">
                                              비밀번호가 일치하지 않습니다
                                            </span>
                                          )}
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
                                            disabled={
                                              deleteTarget
                                                ? !deletePassword.trim()
                                                : !editPassword.trim()
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
                                    marginLeft: "0px",
                                  }}
                                  onSubmit={(e) =>
                                    handleReplySubmit(e, post.id)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="comment-inputs">
                                    <textarea
                                      placeholder="답글 내용"
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
                                {comment.replies.map((reply) => {
                                  const isReplyMultiLine =
                                    reply.content &&
                                    reply.content.includes("\n");
                                  return (
                                    <div
                                      key={reply.id}
                                      className="reply-wrapper"
                                    >
                                      <div
                                        className="reply-item"
                                        style={{
                                          marginLeft:
                                            reply.depth && reply.depth >= 1
                                              ? `${
                                                  (reply.depth - 1) * 10 + 10
                                                }px`
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
                                          } ${
                                            isReplyMultiLine ? "multi-line" : ""
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
                                                  e.target.style.height =
                                                    "auto";
                                                  e.target.style.height = `${e.target.scrollHeight}px`;
                                                }}
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                                className="comment-content-input editing"
                                                rows={1}
                                                style={{
                                                  flex: 1,
                                                  height:
                                                    editingItem.initialHeight
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
                                                  (deleteTarget?.type ===
                                                    "reply" &&
                                                    deleteTarget?.id ===
                                                      reply.id) ||
                                                  (editTarget?.type ===
                                                    "reply" &&
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
                                                    editingItem?.type ===
                                                      "reply" &&
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
                                                    editingItem?.type ===
                                                      "reply" &&
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
                                                  (editTarget?.type ===
                                                    "reply" &&
                                                    editTarget?.id ===
                                                      reply.id) ? (
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
                                                      {passwordError && (
                                                        <span className="password-error-message">
                                                          비밀번호가 일치하지
                                                          않습니다
                                                        </span>
                                                      )}
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
                                                        disabled={
                                                          deleteTarget
                                                            ? !deletePassword.trim()
                                                            : !editPassword.trim()
                                                        }
                                                      >
                                                        {deleteTarget
                                                          ? "삭제"
                                                          : "수정"}
                                                      </button>
                                                    </div>
                                                  ) : null}

                                                  {/* Edit Save/Cancel Buttons - Removed as requested, now inline in edit form */}
                                                  {editingItem?.type ===
                                                    "reply" &&
                                                    editingItem?.id ===
                                                      reply.id &&
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
                                              marginLeft: (() => {
                                                // 새 답글의 depth는 부모의 depth + 1
                                                const newReplyDepth =
                                                  (activeReply.depth || 0) + 1;
                                                // depth >= 1 부터 들여쓰기 적용
                                                return newReplyDepth >= 1
                                                  ? `${
                                                      (newReplyDepth - 1) * 10 +
                                                      10
                                                    }px`
                                                  : "0px";
                                              })(),
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
                                                  e.target.style.height =
                                                    "30px";
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
                                                    handleReplySubmit(
                                                      e,
                                                      post.id
                                                    );
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
                                                  !replyInputs[comment.id]
                                                    ?.password
                                                }
                                              >
                                                등록
                                              </button>
                                            </div>
                                          </form>
                                        )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 댓글 작성 폼 */}
                      <form
                        className="comment-form"
                        onSubmit={(e) => handleCommentSubmit(e, post.id)}
                      >
                        <div className="comment-inputs">
                          <textarea
                            placeholder="댓글 내용"
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {(() => {
              const pages = [];
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, currentPage + 2);

              // 시작이나 끝에 가까우면 5개 보여주기
              if (currentPage <= 3) {
                endPage = Math.min(5, totalPages);
              }
              if (currentPage >= totalPages - 2) {
                startPage = Math.max(1, totalPages - 4);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    className={`pagination-btn ${
                      currentPage === i ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(i)}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        )}

        {/* 게시글 수 표시 */}
        {posts.length > 0 && (
          <div className="posts-info">
            총 {posts.length}개의 게시글 (페이지 {currentPage}/{totalPages})
          </div>
        )}
      </div>
    </div>
  );
}
