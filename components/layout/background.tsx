import Image from "next/image";
import nebula from "@/public/bg.webp";

// One image, slowly drifting on the GPU. The blurred placeholder is inlined in the HTML,
// so the nebula shows on first paint and sharpens when the full image lands.
const Background = () => (
  <div className="fixed inset-0 -z-20 h-screen w-full overflow-hidden bg-black print:hidden">
    <Image
      src={nebula}
      alt=""
      fill
      priority
      quality={75}
      sizes="100vw"
      placeholder="blur"
      className="drift object-cover [filter:grayscale(0.25)]"
    />
  </div>
);

export default Background;
