import React from 'react'

const Navbar = () => {
    return (
        <header
            className="w-full top-0 sticky bg-surface  shadow-sm z-50"
        >
            <div
                className="flex justify-between items-center px-margin-desktop py-4 max-w-7xl mx-auto"
            >

                <div
                    className="font-headline-md text-headline-md font-bold text-primary "
                >
                    RecipeBox
                </div>

                <div className="flex-1 max-w-xl mx-md hidden md:block">
                    <div className="relative relative-input">
                        <span
                            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                        >search</span>
                        <input
                            className="w-full bg-transparent border-b border-outline focus:border-primary focus:ring-0 px-12 py-3 rounded-t-lg transition-colors font-body-md text-body-md peer"
                            id="global-search"
                            placeholder=" "
                            type="text"
                        />
                        <label
                            className="absolute left-12 top-1/2 -translate-y-1/2 text-outline transition-all duration-200 pointer-events-none font-label-md text-label-md"
                            htmlFor="global-search"
                        >Search ingredients, recipes...</label>
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