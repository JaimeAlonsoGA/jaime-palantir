import { Eyebrow, Panel, PillLink } from "@/components/ui/surface";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black/60 px-5">
      <Panel as="article" className="enter-rise w-full max-w-sm p-8 text-center">
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-3 text-3xl font-light text-white">Nothing here</h1>
        <div className="mt-7 flex justify-center gap-2">
          <PillLink href="/projects" arrow>Projects</PillLink>
          <PillLink href="/" variant="glass">Home</PillLink>
        </div>
      </Panel>
    </div>
  );
}
