import { gsap } from 'gsap'
import Events from '../lib/events'

const $loader = document.querySelector('.c-loader')

PubSub.subscribe(Events.IMAGE_UPLOAD_NEW_IMAGE, onNewImage)

const loaderTl = gsap.timeline({
  repeat: -1
})

const shineTl = gsap.timeline({
  delay: 0.5
})

const shineRotation = 30

const shineInAnim = gsap.to(
  $loader.querySelectorAll('.c-loader__shine'),
  { 
    rotate: shineRotation,
    scale: 3, 
    duration: 0.2, 
    ease: 'linear',
  }
)
const shineOutAnim = gsap.to(
  $loader.querySelectorAll('.c-loader__shine'),
  { 
    rotate: shineRotation * 2,
    opacity: 0,
    duration: 0.3, 
    ease: 'linear',
  }
)

const shine2InAnim = gsap.to(
  $loader.querySelectorAll('.c-loader__shine-2'),
  { 
    rotate: -shineRotation,
    scale: 3, 
    duration: 0.2, 
    ease: 'linear',
  }
)
const shine2OutAnim = gsap.to(
  $loader.querySelectorAll('.c-loader__shine-2'),
  { 
    rotate: -shineRotation * 2,
    opacity: 0,
    duration: 0.3, 
    ease: 'linear',
  }
)

const circleAnim = gsap.fromTo(
  $loader.querySelectorAll('.c-loader__circle'),
  { 
    scale: 0,
  },
  { 
    scale: 4, 
    duration: 1.2, 
    opacity: 1,
    delay: 0.01,
    ease: 'power3.in',
    transformOrigin: '30% 40%'
  }
)

shineTl.add(shineInAnim)
shineTl.add(shineOutAnim)
shineTl.add(shine2InAnim, '-=0.3')
shineTl.add(shine2OutAnim)

var squishDur = 0.2
var riseDur = 0.3
var fallDur = 0.3
var relaxDur = 0.2

var $tooth = document.querySelector('.c-loader__tooth')
var $shadow = document.querySelector('.c-loader__shadow')

var bounceTl = gsap.timeline()

var squish = [
    gsap.to($shadow, { duration: squishDur, scaleX: 1.3, transformOrigin: '50% 50%', ease: 'sine.inOut' }),
    gsap.to($tooth, { duration: squishDur, scaleX: 1.2, scaleY: 0.65, y: 7, transformOrigin: '50% 70%', ease: 'sine.inOut' })
]

var rise = [
    gsap.to($shadow, { duration: riseDur, scaleX: 0.5, transformOrigin: '50% 50%', ease: 'sine.inOut' }),
    gsap.to($tooth, { duration: riseDur, scaleX: 0.85, scaleY: 1.1, y: -12, transformOrigin: '50% 65%', ease: 'quad.inOut' })
]

var fall = [
    gsap.to($shadow, { duration: fallDur, scaleX: 1.2, transformOrigin: '50% 50%', ease: 'quad.inOut' }),
    gsap.to($tooth, { duration: fallDur, scaleX: 1.1, scaleY: 0.8, y: 6, transformOrigin: '50% 50%', ease: 'quad.inOut' })
]

var relax = [
    gsap.to($shadow, { duration: relaxDur + 0.045, scaleX: 1, transformOrigin: '50% 50%', ease: 'sine.inOut' }),
    gsap.to($tooth, { duration: relaxDur, scale: 1, y: 0, transformOrigin: '50% 50%', ease: 'sine.inOut' })
]

bounceTl.add(squish)
bounceTl.add(rise)
bounceTl.add(fall, '+=.025')
bounceTl.add(relax, '+=.05')


loaderTl.add(bounceTl)
loaderTl.add([circleAnim, shineTl], '-=1.5')

function onNewImage() {
  loaderTl.kill()
}