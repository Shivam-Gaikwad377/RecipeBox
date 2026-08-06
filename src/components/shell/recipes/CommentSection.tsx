import React from 'react'

const CommentSection = () => {
  return (
    <body className="bg-background text-on-background min-h-screen">
    
    <main className="w-full px-margin-mobile md:px-margin-desktop py-xl">
      
        
        <div
          className="flex items-center justify-between mb-lg border-b border-surface-variant pb-sm"
        >
          <h2 className="font-headline-sm text-headline-sm text-on-background">
            Comments (24)
          </h2>
          <div className="relative group">
            <button
              className="flex items-center gap-base font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            >
              Sort by: Newest
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>

            <div
              className="absolute right-0 top-full mt-xs bg-surface-container-lowest border border-surface-variant rounded-lg shadow-lg hidden group-hover:flex flex-col py-2 w-40 z-10"
            >
              <a
                className="px-4 py-2 font-label-sm text-label-sm hover:bg-surface-container-low text-primary font-semibold"
                href="#"
                >Newest</a>
              <a
                className="px-4 py-2 font-label-sm text-label-sm hover:bg-surface-container-low text-on-surface-variant"
                href="#"
                >Most liked</a>
            </div>
          </div>
        </div>
        
        <div className="flex gap-md mb-xl">
          <div className="flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant shadow-sm"
            >
              <img
                alt="Current user avatar"
                className="w-full h-full object-cover"
                data-alt="A detailed headshot portrait of an adult female in her late 20s with warm, inviting lighting. She is wearing a modern, minimalist apricot top against a clean off-white background, perfectly matching the warm minimalist aesthetic of the UI. Soft focus background."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyOric1lVeuFN6CdJnlUOS2QlixeJW5XWIsYgRWw8lDQK58kdEe7gs8ifGdH-VDofNzqCadrMwXtlJGQqTWFYh2-bIjd8tidZsazliouuIuAtNNTL_peLhVRc6rezsqdrZlnibljVTxsd1Jq3D1iY3okWajAOXhCdYGsa6Wyx3I5O6MF4U3cCRvUAo0msEi0Z14Qu2aFL3Nmzu5R4HnffYdvfrZrIGhZ8BFycsO3ocSdv_JF-OMvGI"
              />
            </div>
          </div>
          <div className="flex-grow flex flex-col gap-sm">
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-background focus:ring-1 focus:ring-primary focus:border-primary resize-y min-h-[100px] transition-all"
              placeholder="Share your thoughts or variations on this recipe..."
            ></textarea>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant"
                >0 / 500</span>
              <button
                className="px-6 py-2 rounded-full bg-surface-container-high text-tertiary font-label-md text-label-md opacity-50 cursor-not-allowed transition-colors"
                
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-lg">
          
       
        <div className="mt-xl flex justify-center">
          <button
            className="px-8 py-3 rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors duration-200 shadow-sm flex items-center gap-xs"
          >
            Load more comments
            <span className="material-symbols-outlined text-[18px]"
              >expand_more</span>
          </button>
        </div>
      </div>
    </main>
    
  </body>
  )
}

export default CommentSection