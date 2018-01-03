(function (){
    var allCarousels = document.querySelectorAll('.sublime-carousel')
    allCarousels.forEach(Carousel)

    function Carousel(carousel){
        var SLIDE_SPEED_IN_MILLIS = carousel.getAttribute('data-speed') || 500

        // set state vars
        var currentItem = 0
        var moving = false
        var shelves = {}

        // scrape the DOM
        // var carousel = document.querySelector('.carousel')
        var allItems = carousel.querySelectorAll('.carousel-item')

        // build the carousel
        ;['stage', 'sled', 'blips'].forEach(function(divName, idx){
          var div = document.createElement('div')
          div.classList = divName
          carousel.appendChild(div)
          shelves[divName] = div
        })
        
        // build prev/next
        ;['prev', 'next'].forEach(function(buttonName, idx){
          var button = document.createElement('button')
          button.classList = 'nav ' + buttonName + '-button'
          button.onclick = arrowClick.bind(null, idx || -1)
          button.textContent = idx ? '>' : '<'
          carousel.appendChild(button)
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
          shelves.blips.appendChild(blip)
        }
        
        // display the first item
        var firstItem = allItems[0]
        firstItem.style.display = 'flex'
        shelves.stage.appendChild(firstItem)

        // make arrow keys mimic prev/next
        function handleKeys(e){
            var delta = e.which === 37 ? -1 : e.which === 39 ? 1 : 0
            if (delta) arrowClick(delta)
        }
        
        // set correct appearance for blips
        function updateBlips(outgoing, incoming){
          var children = shelves.blips.childNodes
          children[outgoing].classList.remove('current')
          children[incoming].classList.add('current')
        }

        // prev/next nav
        function arrowClick(delta){
          // reject clicks if we're already underway
          if (moving) return
          
          // establish the incoming item and update blips
          var next = currentItem + delta
          var lastItem = allItems.length - 1
          next = next > lastItem ? 0 : next < 0 ? lastItem : next
          updateBlips(currentItem, next)
          
          // ok do it
          performSlide(delta, next)
        }
        
        // jump nav
        function blipClick(n){
          // reject clicks if we're underway or if we're already on this one
          if (moving || currentItem === n) return
          
          // incoming item is established by what we clicked; just update blips
          updateBlips(currentItem, n)

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
          shelves.sled.appendChild(incomingItem)
          shelves.sled.style.left = (delta * 100) + '%';

          // wait a tick, then set transition speed on stage & sled
          requestAnimationFrame(function(){
            var transitionSpeed = SLIDE_SPEED_IN_MILLIS + 'ms ease-out'
            shelves.sled.style.transition = transitionSpeed
            shelves.stage.style.transition = transitionSpeed

            // wait another tick, then set destination values for stage and sled
            requestAnimationFrame(function(){
              shelves.sled.style.left = 0
              shelves.sled.style.width = '100%'
              shelves.sled.style.height = '100%'
              shelves.stage.style.left = (delta === 1 ? -10 : 60) + '%'
              shelves.stage.style.width = '50%'
              shelves.stage.style.height = '50%'
              shelves.stage.style.top = '25%'
              shelves.stage.style.fontSize = '0.5em'

              // wait for the transition to finish, then...
              setTimeout(function(){
                // zap transition speeds
                shelves.sled.style.transition = shelves.stage.style.transition = ''
                
                // reset default positions for stage and sled
                shelves.sled.style.left = '100%'
                shelves.stage.style.left = 0
                shelves.stage.style.width = '100%'
                shelves.stage.style.height = '100%'
                shelves.stage.style.top = 0
                shelves.stage.style.fontSize = '1em'

                // move the incoming item to the stage
                shelves.stage.appendChild(shelves.sled.firstChild)
                
                // move the previous item back to the original container
                var outgoingItem = shelves.stage.firstChild
                outgoingItem.style.display = 'none'
                carousel.insertBefore(outgoingItem, carousel.firstChild)
                
                // set new currentItem
                currentItem = idx
                
                // accept clicks again
                moving = false
              }, SLIDE_SPEED_IN_MILLIS)
            })    
          })
        }
    }
})()
