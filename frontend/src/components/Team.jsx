export default function Team() {
  const members = [
    { name: "Julio", img: "/julio.jpg" },
    { name: "Benedict", img: "/benedict.jpg" },
    { name: "Helga", img: "/helga.jpg" },
    { name: "Timotius", img: "/timotius.jpg" },
    { name: "Edbert", img: "/edbert.jpg" },
  ];

  return (
    <div className="text-white font-poppins w-full flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-10">Our Team</h1>

      {/* Circle layout */}
      <div className="flex flex-wrap justify-center gap-10">
        {members.map((m) => (
          <div key={m.name} className="flex flex-col items-center">
            {/* Circle border */}
            <div className="w-50 h-50 rounded-full border-4 border-gray-400 flex items-center justify-center overflow-hidden">
              {/* Placeholder for image */}
              <img src={m.img} alt={m.name} />
              <div className="w-full h-full bg-zinc-600"></div>
            </div>

            {/* Name */}
            <p className="text-xl mt-3">{m.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
