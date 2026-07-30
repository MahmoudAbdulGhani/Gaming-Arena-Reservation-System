const stats = [
    { value: '20+', label: 'Gaming Rooms' },
    { value: '500+', label: 'Sessions / Month' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '24/7', label: 'Online Booking' },
]

export default function StatsBar() {
    return (
        <section className="bg-[#131824] border-y border-[#262D3D]" aria-label="Arena statistics">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p
                                className="text-3xl sm:text-4xl font-black text-[#7C5CFF] mb-1"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                {value}
                            </p>
                            <p className="text-sm text-[#9BA3B7]">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
