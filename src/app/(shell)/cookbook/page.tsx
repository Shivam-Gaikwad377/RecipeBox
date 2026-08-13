import React from 'react'
import AddCookbook from '@/components/shell/cookbook/AddCookbook'
import { usePathname } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import { useState } from 'react'
import { CookbookDocument } from '@/models/cookbook.model';
const page = () => {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [cookbook, setCookbooks] = useState<CookbookDocument | null>(null);
  const {loading, error} = useFetch<CookbookDocument | null>(`/api/users/${id}/cookbook`, {}, setCookbooks);
  return (

    <body
      className="bg-surface text-on-surface font-body-md antialiased min-h-screen pb-xl"
    >

      <nav
        className="w-full px-margin-mobile md:px-margin-desktop py-4 mx-auto flex items-center bg-surface sticky top-0 z-50"
      >
        <a
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200"
          href="#"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: '"FILL" 0' }}
          >
            arrow_back
          </span>
          <span className="font-label-md text-label-md">My cookbooks</span>
        </a>
      </nav>
      <main className="mx-auto px-margin-mobile md:px-margin-desktop pt-md">

        <section className="mb-lg">

          <div
            className="w-full h-50 md:h-75 rounded-xl overflow-hidden mb-6 relative shadow-sm"
          >
            <img
              alt="Fresh ingredients on a wooden kitchen counter"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida/AP1WRLsf4qXgho8SznHXmkLRb7hTKUJ1pKReGWH_fmLn2J7pEF9OC8sv9F-gOIo6nDTjk3TAP0yCKkZBXQj8-ILp_4jdb0Facq7VoWCwumTO3hZeyIHJIKImzzfF7yZEXjp2QUcbfWsR1ACH384k0jVGFUd8RIySTGSGn8ikp__c3-2VAv3e91RpxnCfNBrTv4qv8y9vq4pngQQueO2T4I2tgOPcnLrDvuAICg9HL03TCoIwdLpMst7QVGNaEUM"
            />
          </div>

          <div
            className="flex flex-col md:flex-row md:justify-between md:items-start gap-4"
          >
            <div className="flex-1">
              <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
                {cookbook?.title || "My Cookbook"}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                {cookbook?.description || "A collection of my favorite recipes."}
              </p>
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-[18px]"
                >menu_book</span>
                <span className="font-label-sm text-label-sm">{cookbook?.recipes?.length || 0} recipes</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Edit cookbook"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-200"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button
                aria-label="Delete cookbook"
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors duration-200"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </section>
        <hr className="border-outline-variant/30 mb-lg" />

        <section>
          
        </section>
      </main>
    </body>
  )
}

export default page