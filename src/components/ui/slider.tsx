import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { cn } from 'cn'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  return (
    <SliderPrimitive.Root
      className={cn(
        `
          data-horizontal:w-full
          data-vertical:h-full
        `,
        className,
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className="
          relative
          flex
          w-full
          touch-none
          items-center
          select-none
          data-disabled:opacity-50
          data-vertical:h-full
          data-vertical:min-h-40
          data-vertical:w-auto
          data-vertical:flex-col
        "
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="
            relative
            grow
            overflow-hidden
            rounded-full
            bg-[var(--color-primary-kurio)]/45
            select-none
            data-horizontal:h-[3px]
            data-horizontal:w-full
            data-vertical:h-full
            data-vertical:w-[3px]
          "
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="
              bg-[var(--color-primary-kurio)]
              select-none
              data-horizontal:h-full
              data-vertical:w-full
            "
          />
        </SliderPrimitive.Track>

        {Array.from(
          {
            length: values.length,
          },
          (_, index) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              key={index}
              className="
                relative
                block
                size-4
                shrink-0
                rounded-full
                border-2
                border-[var(--color-ink)]
                bg-[var(--color-primary-kurio)]
                shadow-none
                outline-none
                ring-0
                transition-[box-shadow,transform]
                select-none
                after:absolute
                after:-inset-2
                hover:scale-[1.04]
                focus-visible:ring-2
                focus-visible:ring-[var(--color-primary-kurio)]/30
                active:scale-[0.96]
                disabled:pointer-events-none
                disabled:opacity-50
              "
            />
          ),
        )}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }