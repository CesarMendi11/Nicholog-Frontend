import { trigger, transition, style, query, animate, group, animateChild,stagger } from '@angular/animations';

/**
 * Animación para listas: Hace que los elementos aparezcan de forma escalonada.
 * Uso: Añadir `@listStagger` al contenedor de la lista.
 */
export const listStaggerAnimation = trigger('listStagger', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(-15px)' }),
        stagger(
          '50ms',
          animate(
            '550ms ease-out',
            style({ opacity: 1, transform: 'translateY(0)' })
          )
        ),
      ],
      { optional: true }
    )
  ])
]);

/**
 * Animación para transiciones de ruta: Fundido entre vistas.
 * Uso: Añadir `[@routeFade]="getRouteAnimationData()"` al contenedor del router-outlet.
 */
export const routeFadeAnimation =
  trigger('routeFade', [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0 })
      ], { optional: true }),
      query(':leave', animateChild(), { optional: true }),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('300ms ease-out', style({ opacity: 1 }))
        ], { optional: true })
      ]),
      query(':enter', animateChild(), { optional: true }),
    ])
  ]);