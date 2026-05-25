const cards = Array.from(document.querySelectorAll('.work-card'))
const preview = document.getElementById('preview')
const previewImg = document.getElementById('previewImg')
const previewTitle = document.getElementById('previewTitle')
const previewClose = document.getElementById('previewClose')

function restartImagePlayback(img, src) {
	if (!img || !src) return

	const playToken = `${performance.now()}-${Math.random()}`
	img.dataset.playToken = playToken
	img.removeAttribute('src')

	requestAnimationFrame(() => {
		if (img.dataset.playToken === playToken) {
			img.src = src
		}
	})
}

cards.forEach((card, index) => {
	card.style.setProperty('--delay', `${index * 0.06}s`)
})

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('in')
				observer.unobserve(entry.target)
			}
		})
	},
	{ threshold: 0.16 }
)

cards.forEach((card) => observer.observe(card))

cards.forEach((card) => {
	const motionImg = card.querySelector('.work-card__motion')

	if (motionImg) {
		const motionSrc = motionImg.getAttribute('src') || ''
		if (motionSrc) {
			motionImg.dataset.motionSrc = motionSrc
		}

		motionImg.removeAttribute('src')

		card.addEventListener('mouseenter', () => {
			restartImagePlayback(motionImg, motionImg.dataset.motionSrc || '')
		})

		card.addEventListener('mouseleave', () => {
			motionImg.dataset.playToken = ''
			motionImg.removeAttribute('src')
		})
	}

	card.addEventListener('mousemove', (event) => {
		const rect = card.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top
		const rotateY = (x / rect.width - 0.5) * 6
		const rotateX = (0.5 - y / rect.height) * 6

		card.style.transform = `translateY(-4px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
	})

	card.addEventListener('mouseleave', () => {
		card.style.transform = ''
	})

	card.addEventListener('click', () => {
		openPreview(card.dataset.src || '', card.dataset.title || '')
	})
})

function openPreview(src, title) {
	if (!src) return

	restartImagePlayback(previewImg, src)
	previewTitle.textContent = title
	preview.classList.add('is-open')
	preview.setAttribute('aria-hidden', 'false')
	document.body.style.overflow = 'hidden'
}

function closePreview() {
	preview.classList.remove('is-open')
	preview.setAttribute('aria-hidden', 'true')
	document.body.style.overflow = ''
	previewImg.dataset.playToken = ''
	setTimeout(() => {
		previewImg.removeAttribute('src')
	}, 200)
}

previewClose.addEventListener('click', closePreview)

preview.addEventListener('click', (event) => {
	if (event.target === preview) {
		closePreview()
	}
})

window.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && preview.classList.contains('is-open')) {
		closePreview()
	}
})
