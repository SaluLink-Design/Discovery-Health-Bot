/**
 * Authi orb — layered composition from Figma (node 2009:9).
 * @see https://www.figma.com/design/giuih1h2pGvAeFGJS2jq1K/Untitled?node-id=2009-9
 */

const ASPECT = 904 / 920;

const LAYERS = {
  blueRight: '/authi/blue-right.svg',
  pinkLeft: '/authi/pink-left.svg',
  greenLeft: '/authi/green-left.svg',
  bottomPink: '/authi/bottom-pink.svg',
  ellipse29: '/authi/ellipse-29.png',
  ellipse30: '/authi/ellipse-30.svg',
  ellipse14: '/authi/ellipse-14.svg',
};

export default function AuthiOrb({ size = 90, className = '' }) {
  const width = size;
  const height = Math.round(size * ASPECT);

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width, height }}
      aria-hidden
      data-name="Authi"
    >
      <div
        className="absolute inset-0 flex items-center justify-center mix-blend-plus-lighter"
        style={{ containerType: 'size' }}
      >
        <div className="flex-none h-[hypot(-41.1295cqw,-60.3887cqh)] w-[hypot(-58.8705cqw,39.6113cqh)] rotate-[145.9deg]">
          <div className="relative size-full">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src={LAYERS.blueRight}
            />
          </div>
        </div>
      </div>

      <div
        className="absolute inset-[1.19%_9.6%_13.79%_1.96%] flex items-center justify-center"
        style={{ containerType: 'size' }}
      >
        <div className="flex-none h-[hypot(35.8043cqw,43.479cqh)] w-[hypot(64.1957cqw,-56.521cqh)] -rotate-[40.41deg]">
          <div className="relative size-full">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src={LAYERS.pinkLeft}
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-[7.14%_8.6%_34.35%_19.57%]">
        <img
          alt=""
          className="absolute inset-0 block size-full max-w-none"
          src={LAYERS.greenLeft}
        />
      </div>

      <div className="absolute inset-[45.69%_26.41%_17.66%_50.63%]">
        <img
          alt=""
          className="absolute inset-0 block size-full max-w-none"
          src={LAYERS.bottomPink}
        />
      </div>

      <div
        className="absolute inset-[3.29%_22.55%_47.22%_13.1%] flex items-center justify-center"
        style={{ containerType: 'size' }}
      >
        <div className="flex-none h-[100cqh] w-[100cqw] rotate-180">
          <div className="relative size-full">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src={LAYERS.ellipse29}
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-[23.94%_27.49%_32.57%_29.75%] mix-blend-plus-lighter">
        <div className="absolute inset-[-0.74%]">
          <img alt="" className="block size-full max-w-none" src={LAYERS.ellipse30} />
        </div>
      </div>

      <div
        className="absolute inset-[28.61%_30.72%_38.95%_34.64%] flex items-center justify-center"
        style={{ containerType: 'size' }}
      >
        <div className="flex-none h-[100cqw] w-[100cqh] rotate-90">
          <div className="relative size-full">
            <img
              alt=""
              className="absolute inset-0 block size-full max-w-none"
              src={LAYERS.ellipse14}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
