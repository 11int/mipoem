"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export default function SubmitPoem() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [poem, setPoem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => setMounted(true), []);

  const hasContent =
    author.trim() !== "" || title.trim() !== "" || poem.trim() !== "";

  function reset() {
    setAuthor("");
    setTitle("");
    setPoem("");
    setError(null);
    setSubmitting(false);
    setConfirmDiscard(false);
  }

  function doClose() {
    setOpen(false);
    reset();
  }

  function attemptClose() {
    if (submitting) return;
    if (hasContent) {
      setConfirmDiscard(true);
      return;
    }
    doClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (poem.trim().length < 2) {
      setError("Please write a poem first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, title, poem }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setOpen(false);
      reset();
      router.push(`/poems/${data.slug}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button className="share-button" onClick={() => setOpen(true)}>
        Share a poem
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="modal-overlay" onClick={attemptClose}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Share a poem"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={attemptClose}
              aria-label="Close"
              type="button"
            >
              &times;
            </button>

            <h2 className="modal-title">Share a poem</h2>
            <p className="modal-sub">
              Write something. It joins the wall for everyone to read.
            </p>

            <form onSubmit={handleSubmit} className="poem-form">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                maxLength={60}
              />

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                maxLength={120}
              />

              <textarea
                value={poem}
                onChange={(e) => setPoem(e.target.value)}
                placeholder="Your poem"
                rows={8}
                maxLength={4000}
                required
              />

              <p className="form-hint">
                Tip: wrap a word in asterisks — <code>*like this*</code> — to
                give it a <em>red highlight</em>.
              </p>

              {error && <p className="form-error">{error}</p>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={attemptClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Posting…" : "Post poem"}
                </button>
              </div>
            </form>

            {confirmDiscard && (
              <div
                className="discard-overlay"
                onClick={() => setConfirmDiscard(false)}
              >
                <div
                  className="discard-box"
                  role="alertdialog"
                  aria-modal="true"
                  aria-label="Discard poem?"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="discard-title">Discard this poem?</h3>
                  <p className="discard-sub">
                    You&apos;ve written something that hasn&apos;t been posted
                    yet.
                  </p>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setConfirmDiscard(false)}
                    >
                      Keep writing
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={doClose}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
          document.body
        )}
    </>
  );
}
