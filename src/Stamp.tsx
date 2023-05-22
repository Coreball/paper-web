const Stamp0 = ({ text }: StampVariantProps) => (
  <text x={0} y={0} textAnchor="middle" fontSize={32} fill="red">
    {text}
  </text>
)

const Stamp1 = ({ text }: StampVariantProps) => (
  <text x={0} y={0} textAnchor="middle" fontSize={32} fill="blue">
    {text}
  </text>
)

export const Stamp = ({ x, y, angle, text, variant }: StampProps) => {
  const variants = [Stamp0, Stamp1]
  const StampVariant =
    variant >= 0 && variant < variants.length ? variants[variant] : variants[0]
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      style={{ userSelect: 'none' }}
    >
      <StampVariant text={text} />
    </g>
  )
}

type StampProps = {
  x: number
  y: number
  angle: number
  text: string
  variant: number
}

type StampVariantProps = {
  text: string
}
