# Animation System

This directory contains a comprehensive animation system built with Framer Motion for the FinAI webapp. The system provides reusable, responsive, and performant animations across all components.

## Components

### Core Animation Components

#### AnimatedContainer
A wrapper component that provides stagger animations for child elements.

```tsx
<AnimatedContainer stagger={true}>
  {items.map(item => <Item key={item.id} />)}
</AnimatedContainer>
```

#### AnimatedCard
An animated card component with hover and tap interactions.

```tsx
<AnimatedCard delay={0.2} hover={true}>
  <CardContent>Content</CardContent>
</AnimatedCard>
```

#### AnimatedButton
An animated button component that extends the base Button with motion effects.

```tsx
<AnimatedButton 
  variant="outline" 
  size="lg" 
  delay={0.3}
  onClick={handleClick}
>
  Click Me
</AnimatedButton>
```

#### AnimatedText
Text component with directional animations (up, left, right).

```tsx
<AnimatedText direction="up" delay={0.4}>
  <h1>Animated Title</h1>
</AnimatedText>
```

#### AnimatedIcon
Icon component with scale and float animations.

```tsx
<AnimatedIcon size="lg" delay={0.5} float={true}>
  <Star className="h-6 w-6" />
</AnimatedIcon>
```

### Layout Components

#### ResponsiveContainer
A responsive container with configurable max-width, padding, and spacing.

```tsx
<ResponsiveContainer 
  maxWidth="lg" 
  padding="md" 
  spacing="lg"
>
  Content
</ResponsiveContainer>
```

#### ResponsiveGrid
A responsive grid system with stagger animations.

```tsx
<ResponsiveGrid 
  cols={{ default: 1, sm: 2, lg: 4 }}
  gap="md"
  stagger={true}
  staggerDelay={0.1}
>
  {items.map(item => <Item key={item.id} />)}
</ResponsiveGrid>
```

### Utility Components

#### AnimatedLoader
A loading component with customizable spinner and text.

```tsx
<AnimatedLoader 
  size="lg" 
  text="Loading data..." 
  showSpinner={true}
/>
```

#### AnimatedNotification
A notification component with bounce animations and auto-close functionality.

```tsx
<AnimatedNotification 
  type="success" 
  show={showNotification}
  onClose={() => setShowNotification(false)}
  autoClose={true}
  duration={5000}
>
  <p>Operation completed successfully!</p>
</AnimatedNotification>
```

## Animation Variants

The system includes predefined animation variants in `@/lib/animations.ts`:

- **Page transitions**: `pageVariants`
- **Stagger animations**: `staggerContainer`, `staggerItem`
- **Card animations**: `cardVariants`
- **Button animations**: `buttonVariants`
- **Text animations**: `fadeInUp`, `fadeInLeft`, `fadeInRight`
- **Scale animations**: `scaleIn`
- **Slide animations**: `slideInFromTop`, `slideInFromBottom`
- **Loading animations**: `loadingVariants`, `pulseVariants`
- **Notification animations**: `bounceVariants`, `shakeVariants`
- **Floating animations**: `floatVariants`

## Responsive Design

All components are built with responsive design in mind:

- **Mobile-first approach**: Components adapt from mobile to desktop
- **Breakpoint-aware**: Uses Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- **Flexible layouts**: Grid and container components adjust to screen size
- **Touch-friendly**: Optimized for mobile interactions

## Performance

- **Hardware acceleration**: Uses transform and opacity for smooth animations
- **Reduced motion support**: Respects user's motion preferences
- **Optimized re-renders**: Uses React.memo and proper dependency arrays
- **Lazy loading**: Animations only run when components are in view

## Usage Guidelines

1. **Consistent timing**: Use the predefined delay increments (0.1s, 0.2s, etc.)
2. **Stagger effects**: Use stagger for lists and grids to create flowing animations
3. **Performance**: Avoid animating layout properties, use transform and opacity
4. **Accessibility**: Ensure animations don't interfere with screen readers
5. **Mobile optimization**: Test on actual devices for touch interactions

## Examples

### Landing Page Hero Section
```tsx
<motion.div variants={pageVariants} initial="initial" animate="in">
  <AnimatedText direction="up" delay={0.2}>
    <h1>Welcome to FinAI</h1>
  </AnimatedText>
  <AnimatedButton delay={0.4}>
    Get Started
  </AnimatedButton>
</motion.div>
```

### Dashboard Cards Grid
```tsx
<ResponsiveGrid 
  cols={{ default: 1, sm: 2, lg: 4 }}
  stagger={true}
>
  {metrics.map((metric, index) => (
    <AnimatedCard key={metric.id} delay={index * 0.1}>
      <MetricCard data={metric} />
    </AnimatedCard>
  ))}
</ResponsiveGrid>
```

### Loading State
```tsx
<AnimatedLoader 
  size="lg" 
  text="Processing your financial data..."
  showSpinner={true}
/>
```

This animation system provides a solid foundation for creating engaging, responsive, and performant user interfaces throughout the FinAI application.
