import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import Document       from '@tiptap/extension-document'
import Paragraph      from '@tiptap/extension-paragraph'
import Text           from '@tiptap/extension-text'
import Bold           from '@tiptap/extension-bold'
import Italic         from '@tiptap/extension-italic'
import Strike         from '@tiptap/extension-strike'
import Code           from '@tiptap/extension-code'
import CodeBlock      from '@tiptap/extension-code-block'
import Heading        from '@tiptap/extension-heading'
import BulletList     from '@tiptap/extension-bullet-list'
import OrderedList    from '@tiptap/extension-ordered-list'
import ListItem       from '@tiptap/extension-list-item'
import Blockquote     from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import History        from '@tiptap/extension-history'
import Placeholder    from '@tiptap/extension-placeholder'

// ── Toolbar button ────────────────────────────────────────────────
function TBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      className={`toolbar-btn${active ? ' active' : ''}`}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

const Divider = () => <div className="toolbar-divider" aria-hidden="true" />

// ── Icons ─────────────────────────────────────────────────────────
const icons = {
  bold:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  strike:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4s-4 1.5-4 3.5c0 3 4 3.5 4 3.5"/><path d="M8 18s1.5 2 4 2 4-1.5 4-3.5"/></svg>,
  h2:        <span style={{fontWeight:700,fontSize:'0.7rem',letterSpacing:'-0.03em'}}>H2</span>,
  h3:        <span style={{fontWeight:700,fontSize:'0.7rem',letterSpacing:'-0.03em'}}>H3</span>,
  ul:        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>,
  ol:        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>,
  quote:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>,
  code:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  codeBlock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  hr:        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  undo:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>,
  redo:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>,
}

// ── Main component ─────────────────────────────────────────────────
export default function RichEditor({ content = '', onChange, placeholder = 'Write your release note here…' }) {
  const editor = useEditor({
    extensions: [
      Document, Paragraph, Text,
      Bold, Italic, Strike, Code, CodeBlock,
      Heading.configure({ levels: [2, 3] }),
      BulletList, OrderedList, ListItem,
      Blockquote, HorizontalRule,
      History,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // ── Sync content from parent (critical for edit mode) ────────────
  // TipTap only uses the `content` prop on mount. When the EditorPage
  // loads an existing entry asynchronously, we must manually set the
  // content once it arrives.
  useEffect(() => {
    if (!editor || !content) return
    // Only update if the editor is empty (i.e. content just loaded in)
    // Avoids clobbering user edits mid-session
    const current = editor.getHTML()
    if (current === '' || current === '<p></p>') {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="editor-wrapper">
      {/* ── Toolbar ── */}
      <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">

        <TBtn title="Undo (⌘Z)"  onClick={() => editor.chain().focus().undo().run()}>
          {icons.undo}
        </TBtn>
        <TBtn title="Redo (⌘⇧Z)" onClick={() => editor.chain().focus().redo().run()}>
          {icons.redo}
        </TBtn>

        <Divider />

        <TBtn title="Bold (⌘B)"     onClick={() => editor.chain().focus().toggleBold().run()}   active={editor.isActive('bold')}>
          {icons.bold}
        </TBtn>
        <TBtn title="Italic (⌘I)"   onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          {icons.italic}
        </TBtn>
        <TBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
          {icons.strike}
        </TBtn>
        <TBtn title="Inline code"   onClick={() => editor.chain().focus().toggleCode().run()}   active={editor.isActive('code')}>
          {icons.code}
        </TBtn>

        <Divider />

        <TBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          {icons.h2}
        </TBtn>
        <TBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          {icons.h3}
        </TBtn>

        <Divider />

        <TBtn title="Bullet list"   onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}>
          {icons.ul}
        </TBtn>
        <TBtn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          {icons.ol}
        </TBtn>

        <Divider />

        <TBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          {icons.quote}
        </TBtn>
        <TBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
          {icons.codeBlock}
        </TBtn>
        <TBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          {icons.hr}
        </TBtn>

      </div>

      {/* ── Editor surface ── */}
      <EditorContent editor={editor} />
    </div>
  )
}
