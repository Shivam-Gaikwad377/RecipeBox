import React from 'react'

const AddCookbook = () => {
  return (
    <div className="flex items-center justify-center w-full h-full fixed top-0 left-0 bg-black/50 z-50">
   
   
  
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="relative m-10 w-full max-w-[40%] bg-surface-container-lowest rounded-xl shadow-[0_4px_40px_rgba(30,27,24,0.08)] transform transition-all overflow-hidden flex flex-col"
      role="dialog"
    >

      <div
        className="px-md py-md flex items-center justify-between border-b border-outline-variant/30"
      >
        <h2
          className="font-headline-sm text-headline-sm text-on-surface"
          id="modal-title"
        >
          New cookbook
        </h2>
        <button
          aria-label="Close"
          className="text-on-surface-variant hover:text-on-surface transition-colors duration-200 rounded-full p-2 hover:bg-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          type="button"
        >
          <span className="material-symbols-outlined" data-icon="close">close</span>
        </button>
      </div>

      <div className="p-md space-y-md overflow-y-auto ">
       
        <div className="space-y-sm">
          <label className="block font-label-md text-label-md text-on-surface"
            >Cover Image</label>
          <button
            className="w-full flex flex-col items-center justify-center gap-sm py-lg border-2 border-dashed border-outline-variant rounded-lg bg-surface hover:bg-surface-container-low transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            type="button"
          >
            <div
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors duration-200"
            >
              <span
                className="material-symbols-outlined text-2xl"
                data-icon="add_photo_alternate"
                >add_photo_alternate</span>
            </div>
            <span
              className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors duration-200"
              >Add cover image</span>
            <span
              className="font-label-sm text-label-sm text-tertiary hidden md:block"
              >JPEG or PNG, max 5MB</span>
          </button>
        </div>

        <div className="space-y-sm">
          <label
            className="block font-label-md text-label-md text-on-surface"
            htmlFor="cookbook-title"
            >Title</label>
          <input
            className="w-full bg-surface border-b-2 border-outline-variant rounded-t-lg border-x-0 border-t-0 px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 focus:border-primary transition-colors duration-200 shadow-sm shadow-black/5"
            id="cookbook-title"
            placeholder="Sunday brunch favorites"
            type="text"
          />
        </div>

        <div className="space-y-sm">
          <label
            className="block font-label-md text-label-md text-on-surface"
            htmlFor="cookbook-desc"
            >Description
            <span className="text-on-surface-variant/60 font-normal ml-1"
              >(Optional)</span></label>
          <textarea
            className="w-full bg-surface border-b-2 border-outline-variant rounded-t-lg border-x-0 border-t-0 px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 focus:border-primary transition-colors duration-200 resize-none shadow-sm shadow-black/5"
            id="cookbook-desc"
            placeholder="What's this collection about?"
            rows={3}
          ></textarea>
        </div>
      </div>
 
      <div
        className="px-md py-md bg-surface-container-low border-t border-outline-variant/30 flex justify-end gap-sm items-center"
      >
        <button
          className="px-6 py-2.5 rounded-full font-label-md text-label-md text-primary border border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200 bg-transparent"
          type="button"
        >
          Cancel
        </button>
        <button
          className="px-6 py-2.5 rounded-full font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          type="button"
        >
          Create cookbook
        </button>
      </div>
    </div>
    </div>
  )
}

export default AddCookbook