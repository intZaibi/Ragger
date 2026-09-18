import Link from "next/link";
export default function Footer() {
  return <footer className="border-t border-stone-200 text-[10px] text-stone-500 dark:border-zinc-800 dark:text-zinc-400 [&>div]:mx-auto [&>div]:flex [&>div]:max-w-7xl [&>div]:justify-between [&>div]:gap-3 [&>div]:px-10 [&>div]:py-6 max-sm:[&>div]:flex-col max-sm:[&>div]:items-center [&_a]:text-stone-700 dark:[&_a]:text-zinc-200"><div><span>Less searching. More understanding.</span><span>Made with curiosity by <Link href="https://shahzaib-ali-portfolio.netlify.app" target="_blank" rel="noreferrer">Shahzaib Ali ↗</Link></span></div></footer>;
}
