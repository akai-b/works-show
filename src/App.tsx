import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

type WorkItem = {
	title: string
	file: string
	cover: string
	fallbackCover: string
	video: string
}

const nameFileMap: Record<string, string> = {
	'快来当领主 · 虹猫蓝兔联动': 'kldlz-hmltld',
	'梦游社 · 春节集五福活动': 'mys-cjjwfhd',
	'梦游社 · 发现社交身份': 'mys-fxsjsf',
	'梦游社 · 年度总结': 'mys-ndzj',
	'梦游社 · 花园种植活动': 'myshyzzhd',
	'墨迹大侠 · 荒兽入侵活动': 'mjdx-hsrqhd',
	'武侠大明星 · 祥瑞豹到活动': 'wxdmx-xrbdhd',
	'向僵尸开炮 · 盗墓笔记联动活动': 'xjskp-dmbjldhd',
	'向僵尸开炮 · 一周年活动': 'xjskp-yznhd'
}

const imageModules = import.meta.glob('./assets/images/*.{png,webp,mp4}', {
	eager: true,
	import: 'default'
}) as Record<string, string>

const findAsset = (fileName: string) => imageModules[`./assets/images/${fileName}`] ?? ''

const ratio = 97 / 211

const getTargetRect = () => {
	const maxHeight = window.innerHeight * 0.8
	const maxWidth = window.innerWidth * 0.88
	const width = Math.min(maxWidth, maxHeight * ratio)
	const height = width / ratio

	return {
		x: (window.innerWidth - width) / 2,
		y: (window.innerHeight - height) / 2,
		width,
		height
	}
}

function App() {
	const works = useMemo<WorkItem[]>(
		() =>
			Object.entries(nameFileMap).map(([title, file]) => ({
				title,
				file,
				cover: findAsset(`${file}-cover.png`),
				fallbackCover: findAsset(`${file}.webp`),
				video: findAsset(`${file}.mp4`)
			})),
		[]
	)

	const [hoveredFile, setHoveredFile] = useState<string | null>(null)
	const [activeWork, setActiveWork] = useState<WorkItem | null>(null)
	const [fromRect, setFromRect] = useState<DOMRect | null>(null)
	const [isAnimating, setIsAnimating] = useState(false)

	const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})
	const previewVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
	const overlayRef = useRef<HTMLDivElement | null>(null)
	const backdropRef = useRef<HTMLDivElement | null>(null)
	const playerVideoRef = useRef<HTMLVideoElement | null>(null)

	const playPreview = async (file: string) => {
		const video = previewVideoRefs.current[file]
		if (!video) return

		try {
			video.currentTime = 0
			await video.play()
		} catch {
			// 忽略浏览器自动播放策略导致的异常
		}
	}

	const stopPreview = (file: string) => {
		const video = previewVideoRefs.current[file]
		if (!video) return
		video.pause()
		video.currentTime = 0
	}

	const openWork = (work: WorkItem) => {
		if (isAnimating || activeWork) return
		const rect = cardRefs.current[work.file]?.getBoundingClientRect()
		if (!rect) return

		if (hoveredFile) {
			stopPreview(hoveredFile)
			setHoveredFile(null)
		}

		setFromRect(rect)
		setActiveWork(work)
	}

	const closeWork = () => {
		if (!activeWork || !overlayRef.current || !backdropRef.current || isAnimating) return

		const currentRect = cardRefs.current[activeWork.file]?.getBoundingClientRect() ?? fromRect

		if (!currentRect) {
			setActiveWork(null)
			setFromRect(null)
			return
		}

		setIsAnimating(true)

		const tl = gsap.timeline({
			onComplete: () => {
				setIsAnimating(false)
				setActiveWork(null)
				setFromRect(null)
			}
		})

		tl.to(backdropRef.current, {
			opacity: 0,
			duration: 0.3,
			ease: 'power2.out'
		}).to(
			overlayRef.current,
			{
				x: currentRect.left,
				y: currentRect.top,
				width: currentRect.width,
				height: currentRect.height,
				borderRadius: 20,
				duration: 0.46,
				ease: 'power3.inOut'
			},
			'<'
		)
	}

	useLayoutEffect(() => {
		if (!activeWork || !fromRect || !overlayRef.current || !backdropRef.current) return

		const targetRect = getTargetRect()
		setIsAnimating(true)

		gsap.set(backdropRef.current, { opacity: 0 })
		gsap.set(overlayRef.current, {
			x: fromRect.left,
			y: fromRect.top,
			width: fromRect.width,
			height: fromRect.height,
			borderRadius: 20
		})

		const tl = gsap.timeline({
			onComplete: async () => {
				setIsAnimating(false)
				if (!playerVideoRef.current) return

				try {
					await playerVideoRef.current.play()
				} catch {
					// 忽略自动播放异常
				}
			}
		})

		tl.to(backdropRef.current, {
			opacity: 1,
			duration: 0.35,
			ease: 'power2.out'
		}).to(
			overlayRef.current,
			{
				x: targetRect.x,
				y: targetRect.y,
				width: targetRect.width,
				height: targetRect.height,
				borderRadius: 24,
				duration: 0.56,
				ease: 'power3.out'
			},
			'<'
		)

		return () => {
			tl.kill()
		}
	}, [activeWork, fromRect])

	return (
		<main className="relative min-h-screen overflow-hidden bg-[#05070d] text-white">
			<div className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-10 md:px-8 md:pt-14">
				<header className="mb-8 md:mb-12">
					<p className="mb-3 text-xs uppercase tracking-[0.24em] text-white/45">Portfolio</p>
					<h1 className="text-2xl font-semibold tracking-wide md:text-4xl">个人作品展示</h1>
				</header>

				<section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
					{works.map((work) => {
						const isHovered = hoveredFile === work.file
						const isActive = activeWork?.file === work.file

						return (
							<button
								key={work.file}
								ref={(node) => {
									cardRefs.current[work.file] = node
								}}
								type="button"
								onMouseEnter={() => {
									if (activeWork) return
									setHoveredFile(work.file)
									void playPreview(work.file)
								}}
								onMouseLeave={() => {
									if (hoveredFile === work.file) {
										stopPreview(work.file)
										setHoveredFile(null)
									}
								}}
								onClick={() => openWork(work)}
								className={`group relative aspect-[97/211] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f1321] text-left shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] ${isActive ? 'opacity-0 pointer-events-none' : ''}`}
							>
								<img
									src={work.cover || work.fallbackCover}
									onError={(event) => {
										if (work.fallbackCover) {
											event.currentTarget.src = work.fallbackCover
										}
									}}
									alt={work.title}
									className="absolute inset-0 h-full w-full object-cover"
									loading="lazy"
								/>

								<video
									ref={(node) => {
										previewVideoRefs.current[work.file] = node
									}}
									src={work.video}
									muted
									loop
									playsInline
									preload="metadata"
									disablePictureInPicture
									controlsList="nodownload noplaybackrate noremoteplayback"
									className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
								/>

								<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent p-3">
									<p className="line-clamp-2 text-xs font-medium leading-relaxed text-white/90 md:text-sm">{work.title}</p>
								</div>
							</button>
						)
					})}
				</section>
			</div>

			{activeWork ? (
				<>
					<div ref={backdropRef} className="fixed inset-0 z-40 bg-black/55 backdrop-blur-md" onClick={closeWork} />

					<div ref={overlayRef} className="fixed left-0 top-0 z-50 overflow-hidden border border-white/20 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
						<video ref={playerVideoRef} src={activeWork.video} muted loop autoPlay playsInline preload="metadata" disablePictureInPicture controlsList="nodownload noplaybackrate noremoteplayback" className="h-full w-full object-cover" />
					</div>

					<button type="button" disabled={isAnimating} onClick={closeWork} className="fixed right-4 top-4 z-[60] rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs tracking-wider text-white/90 backdrop-blur transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50 md:right-8 md:top-8">
						关闭
					</button>
				</>
			) : null}
		</main>
	)
}

export default App
