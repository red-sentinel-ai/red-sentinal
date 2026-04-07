'use client'

interface JapaneseSideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function JapaneseSideMenu({ isOpen, onClose }: JapaneseSideMenuProps) {
  return (
    <div className={`japanese-exact-side-menu ${isOpen ? 'active' : ''}`} id="sideMenu">
      <button className="close-icon" onClick={onClose} aria-label="Close menu">
        <i className="ri-close-large-line"></i>
      </button>
      <nav>
        <a href="#" onClick={onClose}>Home</a>
        <a href="#" onClick={onClose}>About</a>
        <a href="#" onClick={onClose}>Blog</a>
        <a href="#" onClick={onClose}>News</a>
      </nav>

      <div className="japanese-exact-side-floating">
        <div className="icon"><i className="ri-search-line"></i></div>
        <div className="icon"><i className="ri-book-line"></i></div>
        <div className="icon"><i className="ri-user-line"></i></div>
        <div className="icon"><i className="ri-chat-1-line"></i></div>
      </div>
    </div>
  )
}
