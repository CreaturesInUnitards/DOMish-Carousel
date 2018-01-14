(function (){
	var allCarousels = document.querySelectorAll('.sublime-carousel')
	allCarousels.forEach(Carousel)

	function Carousel(carousel){
		var SLIDE_SPEED_IN_MILLIS = carousel.getAttribute('data-speed') || 500
		var TRANSITION_SPEED = SLIDE_SPEED_IN_MILLIS + 'ms ease-out'

		// set state vars
		var currentItem = 0
		var moving = false
		var ui_elements = {}

		// scrape the DOM
		// var carousel = document.querySelector('.carousel')
		var allItems = carousel.querySelectorAll('.carousel-item')

			// build the carousel
		;['stage', 'sled', 'blips'].forEach(function(divName, idx){
			var div = document.createElement('div')
			div.setAttribute("class", divName)
			carousel.appendChild(div)
			ui_elements[divName] = div
		})

		// build prev/next
		;['prev', 'next'].forEach(function(buttonName, idx){
			var button = document.createElement('button')
			button.className = 'nav ' + buttonName + '-button'
			button.onclick = arrowClick.bind(null, idx || -1)
			// button.textContent = idx ? '>' : '<'
			carousel.appendChild(button)
			ui_elements[buttonName] = button
		})

		// if there's only 1 carousel, hijack left/right arrows
		if (allCarousels.length === 1) {
			window.addEventListener('keydown', handleKeys)
			window.onunload = function(){
				// be a good citizen
				window.removeEventListener('keydown', handleKeys)
			}
		}

		// build the blips
		for (var i=0; i<allItems.length; i++) {
			var blip = document.createElement('div')
			blip.className = i === 0 ? 'blip current' : 'blip'
			blip.onclick = blipClick.bind(null, i)
			ui_elements.blips.appendChild(blip)
		}

		// display the first item
		var firstItem = allItems[0]
		firstItem.style.display = 'flex'
		ui_elements.stage.appendChild(firstItem)
		ui_elements.prev.classList.add('off')

		// make arrow keys mimic prev/next
		function handleKeys(e){
			var delta = e.which === 37 ? -1 : e.which === 39 ? 1 : 0
			if (delta) arrowClick(delta)
		}

		// set correct appearance for blips
		function updateTheView(outgoing, incoming){
			var children = ui_elements.blips.childNodes
			children[outgoing].classList.remove('current')
			children[incoming].classList.add('current')
			ui_elements.prev.classList[incoming === 0 ? 'add' : 'remove']('off')
			ui_elements.next.classList[incoming === allItems.length - 1 ? 'add' : 'remove']('off')
		}

		// prev/next nav
		function arrowClick(delta){
			// reject clicks if we're already underway
			if (moving) return

			if (currentItem === 0 && delta < 0) return
			if (currentItem === allItems.length - 1 && delta > 0) return

			// establish the incoming item and update blips
			var next = currentItem + delta
			var lastItem = allItems.length - 1
			next = next > lastItem ? 0 : next < 0 ? lastItem : next
			updateTheView(currentItem, next)

			// ok do it
			performSlide(delta, next)
		}

		// jump nav
		function blipClick(n){
			// reject clicks if we're underway or if we're already on this one
			if (moving || currentItem === n) return

			// incoming item is established by what we clicked; just update blips
			updateTheView(currentItem, n)

			// figure out which side of the current blip we clicked on
			var delta = n > currentItem ? 1 : -1

			// ok do it
			performSlide(delta, n)
		}

		// heavy lifting
		function performSlide(delta, idx){
			// reject clicks
			moving = true

			// put the item on the sled, and the sled on the appropriate side
			var incomingItem = allItems[idx]
			incomingItem.style.display = 'flex'
			ui_elements.sled.appendChild(incomingItem)
			ui_elements.sled.style.left = (delta * 100) + '%';

			// wait a tick, then set transition speed on stage & sled
			setTimeout(function(){
				ui_elements.sled.style.transition = TRANSITION_SPEED
				ui_elements.stage.style.transition = TRANSITION_SPEED

				// wait another tick, then set destination values for stage and sled
				requestAnimationFrame(function(){
					ui_elements.sled.style.left = 0
					ui_elements.sled.style.width = '100%'
					ui_elements.sled.style.height = '100%'
					ui_elements.stage.style.left = (delta === 1 ? -10 : 60) + '%'
					ui_elements.stage.style.width = '50%'
					ui_elements.stage.style.height = '50%'
					ui_elements.stage.style.top = '25%'
					ui_elements.stage.style.fontSize = '0.5em'

					// wait for the transition to finish, then...
					setTimeout(function(){
						// zap transition speeds
						ui_elements.sled.style.transition = ui_elements.stage.style.transition = ''

						// reset default positions for stage and sled
						ui_elements.sled.style.left = '100%'
						ui_elements.stage.style.left = 0
						ui_elements.stage.style.width = '100%'
						ui_elements.stage.style.height = '100%'
						ui_elements.stage.style.top = 0
						ui_elements.stage.style.fontSize = '1em'

						// move the incoming item to the stage
						ui_elements.stage.appendChild(ui_elements.sled.firstChild)

						// move the previous item back to the original container
						var outgoingItem = ui_elements.stage.firstChild
						outgoingItem.style.display = 'none'
						carousel.insertBefore(outgoingItem, carousel.firstChild)

						// set new currentItem
						currentItem = idx

						// accept clicks again
						moving = false
					}, SLIDE_SPEED_IN_MILLIS)
				})
			}, 10)
		}
	}
})()
