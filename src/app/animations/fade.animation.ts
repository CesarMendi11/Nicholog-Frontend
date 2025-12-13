import { trigger, animate, transition, style, query, stagger } from '@angular/animations';

// 1. Animación para que el contenido aparezca suavemente al cambiar de ruta
export const fadeAnimation = trigger('fadeAnimation', [
  transition('* => *', [ // Se activa en cualquier cambio de estado
    style({ position: 'relative' }),
    query(':enter', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0,
        transform: 'translateY(20px)' // Empieza un poco más abajo
      })
    ], { optional: true }),
    query(':enter', [
      animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ // Curva de aceleración "Premium"
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ], { optional: true })
  ])
]);

// 2. Animación en cascada para la lista del menú lateral
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-20px)' }),
      stagger('50ms', [ // Retraso de 50ms entre cada item
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ], { optional: true })
  ])
]);

// 1. Entrada de la Tarjeta (Mucho más lenta y dramática)
export const cardEntryAnimation = trigger('cardEntry', [
  transition(':enter', [
    // Empieza un poco más abajo (30px) para que recorra más distancia
    style({ opacity: 0, transform: 'scale(0.95) translateY(30px)' }), 
    // CAMBIO: 500ms -> 1200ms (1.2 segundos)
    animate('1200ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
  ])
]);

// 2. Cascada del Formulario (Inputs entrando uno por uno lentamente)
export const formStaggerAnimation = trigger('formStagger', [
  transition(':enter', [
    query('mat-form-field, button, .social-container, .divider-text', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      // CAMBIO Stagger: 50ms -> 200ms (Más tiempo entre cada elemento)
      stagger('200ms', [
        // CAMBIO Animate: 400ms -> 900ms (El elemento flota más lento)
        animate('900ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const fadeAnimationLogin = trigger('fadeAnimation', [
  transition('* => *', [
    // 1. Configuración inicial: Todo transparente
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),

    // 2. Animación del contenido principal (Cards, Gráficos, Textos)
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }), // Empieza abajo y pequeño
      stagger('150ms', [ // Retraso de 150ms entre cada elemento (Efecto Cascada)
        animate('800ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ])
    ], { optional: true })
  ])
]);