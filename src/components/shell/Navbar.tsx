import React from 'react'

const Navbar = () => {
    return (
        <header
            className="w-full top-0 sticky bg-surface  shadow-sm z-50"
        >
            <div
                className="flex justify-between items-center px-margin-desktop py-4  mx-auto"
            >

                <div
                    className="font-headline-md text-headline-md font-bold text-primary "
                >
                    RecipeBox
                </div>

                <div className="flex-1  mx-md hidden md:block">
                    <div className="relative relative-input">
                        <span
                            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                        >search</span>
                        <input
                            className=" w-full bg-surface-container-lowest border pl-10 border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            id="global-search"
                            placeholder=" "
                            type="text"
                        />

                    </div>
                </div>

                <nav className="flex items-center gap-md">
                    <div className="hidden md:flex gap-md mr-md">
                        <a
                            className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md hover:text-primary transition-colors duration-200"
                            href="#"
                        >Discover</a>
                        <a
                            className="text-on-surface-variant font-medium font-body-md text-body-md hover:text-primary transition-colors duration-200"
                            href="#"
                        >Feed</a>
                        <a
                            className="text-on-surface-variant font-medium font-body-md text-body-md hover:text-primary transition-colors duration-200"
                            href="#"
                        >Cookbooks</a>
                    </div>
                    <div className="flex items-center gap-sm">
                        <button
                            className="text-primary  transition-transform duration-200 active:scale-95 hover:text-primary"
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: '"FILL" 0' }}
                            >notifications</span>
                        </button>
                        <button
                            className="text-primary  transition-transform duration-200 active:scale-95 hover:text-primary"
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: '"FILL" 0' }}
                            >account_circle</span>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navbar