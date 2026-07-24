import React from 'react'
import Image from 'next/image';
import leftImage from "../../../../public/a_beautiful_high_quality_photograph_of_fresh_ingredients_on_a_wooden_kitchen.png"
const Page = () => {
    return (
        <body
            className="bg-background text-on-background antialiased flex flex-col min-h-screen"
        >
            
            
            
            <main
                className="grow  flex flex-col md:flex-row h-screen md:h-auto min-h-screen"
            >

                <div className="hidden md:flex md:w-1/2 relative bg-surface-container-high overflow-hidden">
                    <Image
                        src={leftImage}
                        alt="A beautiful, high-quality photograph of fresh ingredients on a wooden kitchen counter: a rustic bowl of flour, fresh herbs like rosemary and basil, some garlic, a bottle of olive oil, and a vibrant tomato."
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-on-background/60 to-transparent flex flex-col justify-end p-margin-desktop z-10">
                        <blockquote className="font-headline-md text-headline-md text-on-primary mb-sm">
                            "Join the community of home cooks."
                        </blockquote>
                        <p className="font-body-md text-body-md text-surface-container-low">
                            Discover, share, and perfect your favorite recipes with passionate
                            foodies worldwide.
                        </p>
                    </div>
                </div>

                <div
                    className="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface"
                >
                    <div className="w-full ">

                        <div className="text-center mb-xl">
                            <h1
                                className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-sm"
                            >
                                Create an Account
                            </h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant">
                                Start your culinary journey today.
                            </p>
                        </div>

                        <form className="space-y-md">

                            <div className="relative">
                                <label
                                    className="block font-label-md text-label-md text-on-surface-variant mb-xs"
                                    htmlFor="fullName"
                                >Full Name</label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Jane Doe"
                                    type="text"
                                />
                            </div>
                            
                            <div className="relative">
                                <label
                                    className="block font-label-md text-label-md text-on-surface-variant mb-xs"
                                    htmlFor="email"
                                >Email Address</label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="email"
                                    name="email"
                                    placeholder="jane@example.com"
                                    type="email"
                                />
                            </div>
                            
                            <div className="relative">
                                <label
                                    className="block font-label-md text-label-md text-on-surface-variant mb-xs"
                                    htmlFor="password"
                                >Password</label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>

                            <button
                                className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-full hover:bg-primary-container hover:-translate-y-0.5 transition-all shadow-sm active:scale-95 mt-lg"
                                type="submit"
                            >
                                Create Account
                            </button>
                        </form>



                        <div className="mt-xl text-center">
                            <p className="font-body-md text-body-md text-on-surface-variant">
                                Already have an account?
                                <a
                                    className="text-primary font-label-md text-label-md hover:underline transition-all"
                                    href="#"
                                >Log in</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>


        </body>
    )
}

export default Page
