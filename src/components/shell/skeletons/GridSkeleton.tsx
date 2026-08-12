import React from 'react'

const GridSkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="aspect-square rounded-xl bg-surface-container animate-pulse"
                />
            ))}
        </div>
    )
}

export default GridSkeleton