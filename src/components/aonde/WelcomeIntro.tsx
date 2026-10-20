import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import logoMarkup from "./brandLogoMarkup"
import AondeLogo from "./AondeLogo"
import { BodyText, DisplayTitle, Eyebrow } from "./Typography"

// Close-up of the Museu Oscar Niemeyer ("Olho"); the file names in
// public/aonde don't match their contents.
const heroPhoto = "/aonde/museu-arquitetura.jpg"
const heroFade =
  "linear-gradient(to bottom, black 0%, black 52%, transparent 100%)"

const logoParts = Array.from(
  logoMarkup.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g),
  (match) => ({
    path: match[1],
    fill: match[2],
  }),
)
const [pin, face, rightEye, rightPupil, leftEye, leftPupil, brow] = logoParts
const beakContour = face.path.slice(
  face.path.indexOf("C50.2693"),
  face.path.indexOf("C54.6471"),
)
const faceContour = face.path.replace(beakContour, "L54.39 61.9537")
const beakPath = `M51.2396 61.883${beakContour}Z`

type WelcomeIntroProps = {
  playIntro: boolean
  onComplete: () => void
  onLogin: () => void
  onSignup: () => void
  onGuest: () => void
}

export default function WelcomeIntro({
  playIntro,
  onComplete,
  onLogin,
  onSignup,
  onGuest,
}: WelcomeIntroProps) {
  const reducedMotion = useReducedMotion()
  const animateIntro = playIntro && !reducedMotion
  const [loginReady, setLoginReady] = useState(!animateIntro)
  const [signupReady, setSignupReady] = useState(!animateIntro)
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    if (!playIntro) return
    const timers = [window.setTimeout(onComplete, reducedMotion ? 300 : 1800)]
    if (!reducedMotion) {
      timers.push(window.setTimeout(() => setLoginReady(true), 1200))
      timers.push(window.setTimeout(() => setSignupReady(true), 1300))
    }
    return () => timers.forEach(window.clearTimeout)
  }, [playIntro, reducedMotion, onComplete])

  useEffect(() => {
    if (playIntro || reducedMotion) return
    let blinkTimer: number
    let recoveryTimer: number
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(
        () => {
          setBlinking(true)
          recoveryTimer = window.setTimeout(() => {
            setBlinking(false)
            scheduleBlink()
          }, 170)
        },
        4000 + Math.random() * 2000,
      )
    }
    scheduleBlink()
    return () => {
      window.clearTimeout(blinkTimer)
      window.clearTimeout(recoveryTimer)
    }
  }, [playIntro, reducedMotion])

  const eyeAnimation = animateIntro
    ? { scaleY: [0, 0, 1, 1, 0.04, 1], opacity: [0, 0, 1, 1, 1, 1] }
    : { scaleY: blinking ? 0.04 : 1, opacity: blinking ? 0 : 1 }
  const eyeTransition = animateIntro
    ? {
        duration: 1.1,
        times: [0, 0.636, 0.773, 0.818, 0.9, 1],
        ease: "easeInOut" as const,
      }
    : { duration: blinking || !playIntro ? 0.075 : 0 }

  return (
    <motion.div
      key={playIntro ? "launch" : "ready"}
      initial={playIntro && reducedMotion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: playIntro && reducedMotion ? 0.3 : 0 }}
      className="relative flex min-h-full flex-col overflow-hidden px-6 pb-6"
    >
      {/* Hero photo fades into the background instead of ending on a hard edge. */}
      <motion.img
        src={heroPhoto}
        alt=""
        aria-hidden="true"
        initial={animateIntro ? { opacity: 0, scale: 1.08 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 1.4, ease: "easeOut" }}
        style={{ maskImage: heroFade, WebkitMaskImage: heroFade }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[52%] w-full object-cover object-[50%_72%]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-background/70 via-background/0 to-background/0" />

      <motion.div
        initial={animateIntro ? { opacity: 0, y: -8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: animateIntro ? 0.65 : 0,
          duration: reducedMotion ? 0 : 0.45,
        }}
        className="relative z-10 mt-3 flex items-center justify-between"
      >
        <AondeLogo className="h-11 w-28" />
        <span className="glass rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.14em]">
          Curitiba cultural
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-end pb-7 pt-6 text-center">
        <div className="relative flex items-center justify-center">
          <div className="relative flex h-30 w-30 items-center justify-center rounded-[1.9rem] border border-border bg-background shadow-[0_18px_40px_#4c343024]">
            <svg
              role="img"
              aria-label="Logo do aplicativo: coruja em um marcador de localização"
              width="105"
              height="177"
              viewBox="0 0 105 177"
              fill="none"
              className="brand-logo h-22 w-auto max-w-full overflow-visible"
            >
              <motion.ellipse
                aria-hidden="true"
                cx="53.5144"
                cy="166"
                rx="18"
                ry="3.5"
                fill="none"
                stroke={pin.fill}
                strokeWidth="0.8"
                style={{ transformOrigin: "53.5144px 166px" }}
                initial={animateIntro ? { opacity: 0, scale: 0.25 } : false}
                animate={
                  animateIntro
                    ? { opacity: [0, 0.18, 0], scale: [0.25, 1.35, 1.8] }
                    : { opacity: 0, scale: 1 }
                }
                transition={
                  animateIntro
                    ? { delay: 0.5, duration: 0.5, ease: "easeOut" }
                    : { duration: 0 }
                }
              />
              <motion.g
                initial={animateIntro ? { y: -120, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                transition={
                  animateIntro
                    ? {
                        y: { type: "spring", duration: 0.6, bounce: 0.22 },
                        opacity: { duration: 0.08 },
                      }
                    : { duration: 0 }
                }
              >
                <motion.g
                  style={{ transformOrigin: "53.5144px 163.081px" }}
                  initial={false}
                  animate={{
                    scaleY: animateIntro ? [1, 1, 0.96, 1.015, 1] : 1,
                  }}
                  transition={
                    animateIntro
                      ? {
                          duration: 0.72,
                          times: [0, 0.68, 0.76, 0.87, 1],
                          ease: "easeInOut",
                        }
                      : { duration: 0 }
                  }
                >
                  <g data-logo-part="pin">
                    <path d={pin.path} fill={pin.fill} />
                  </g>
                  <g data-logo-part="face">
                    <path d={faceContour} fill={face.fill} />
                    <path d={brow.path} fill={brow.fill} />
                  </g>
                  <g data-logo-part="beak">
                    <path d={beakPath} fill={pin.fill} />
                  </g>
                  {[
                    [leftEye, leftPupil, 33.4],
                    [rightEye, rightPupil, 72.6],
                  ].map(([eye, pupil, center], index) => {
                    const eyePart = eye as typeof leftEye
                    const pupilPart = pupil as typeof leftPupil
                    return (
                      <motion.g
                        key={index}
                        data-logo-part="eyes"
                        style={{ transformOrigin: `${center}px 48.6px` }}
                        initial={
                          animateIntro ? { scaleY: 0, opacity: 0 } : false
                        }
                        animate={eyeAnimation}
                        transition={eyeTransition}
                      >
                        <path d={eyePart.path} fill={eyePart.fill} />
                        <motion.g
                          data-logo-part="pupils"
                          initial={false}
                          animate={{
                            y: animateIntro ? [0, 0, 2.6, 2.6, 0] : 0,
                          }}
                          transition={
                            animateIntro
                              ? {
                                  duration: 1.8,
                                  times: [0, 0.61, 0.69, 0.88, 1],
                                  ease: "easeInOut",
                                }
                              : { duration: 0 }
                          }
                        >
                          <path d={pupilPart.path} fill={pupilPart.fill} />
                        </motion.g>
                      </motion.g>
                    )
                  })}
                  <motion.g
                    aria-hidden="true"
                    initial={animateIntro ? { opacity: 1 } : false}
                    animate={{
                      opacity: animateIntro
                        ? [1, 1, 0, 0, 1, 0]
                        : blinking
                          ? 1
                          : 0,
                    }}
                    transition={eyeTransition}
                    stroke={pin.fill}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M22.5 49 Q33.4 55 44.5 49" />
                    <path d="M61.5 49 Q72.6 55 83.5 49" />
                  </motion.g>
                </motion.g>
              </motion.g>
            </svg>
          </div>
        </div>

        <motion.div
          initial={animateIntro ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: animateIntro ? 0.9 : 0,
            duration: reducedMotion ? 0 : 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-6 max-w-[310px]"
        >
          <Eyebrow className="tracking-[.2em]">
            A cidade tem histórias
          </Eyebrow>
          <DisplayTitle className="mt-2.5 text-balance">
            Encontre cultura por onde você for
          </DisplayTitle>
          <BodyText className="mx-auto mt-3 max-w-[280px] text-pretty">
            Descubra museus, salve seus próximos passeios e compartilhe o que
            encontrou em Curitiba.
          </BodyText>
        </motion.div>
      </div>

      <motion.div
        initial={animateIntro ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={
          animateIntro
            ? { delay: 1.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0 }
        }
        className="relative z-10"
      >
        <motion.button
          disabled={animateIntro && !loginReady}
          onClick={onGuest}
          className="min-h-13 w-full rounded-2xl bg-primary px-5 text-[.8em] font-semibold text-background shadow-[0_12px_28px_#3c654340]"
        >
          Explorar Curitiba
        </motion.button>
        <motion.button
          disabled={animateIntro && !signupReady}
          onClick={onSignup}
          className="mt-2.5 min-h-12 w-full rounded-2xl border border-primary/25 bg-surface px-5 text-[.78em] font-semibold"
        >
          Criar minha conta
        </motion.button>
        <button
          disabled={animateIntro && !loginReady}
          onClick={onLogin}
          className="mt-2 min-h-11 w-full text-[.7em] font-medium text-foreground/75"
        >
          Já tenho uma conta?{" "}
          <span className="font-semibold text-accent underline decoration-accent/40 underline-offset-4">
            Entrar
          </span>
        </button>
        <p className="mx-auto mt-1 max-w-[260px] text-center text-[.56em] leading-relaxed text-foreground/55">
          Você pode explorar sem cadastro. Crie uma conta quando quiser salvar
          ou avaliar.
        </p>
      </motion.div>
    </motion.div>
  )
}
