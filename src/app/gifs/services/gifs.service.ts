import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { GiphyResponse } from '../interface/gipy.interfaces';
import { Gif } from '../interface/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';

/** Carga el historial desde localStorage, ignorando en SSR (Server-Side Rendering). */
const loadFronmLocalStorage = (isBrowser: boolean) => {
  if (!isBrowser) return {};
  const gifsFromLocalStorage = localStorage.getItem('gifs') ?? '{}';
  const gifs = JSON.parse(gifsFromLocalStorage);
  return gifs;
};

/**
 * Servicio principal para la gestión de GIFs (API, estado y persistencia).
 */
@Injectable({ providedIn: 'root' })
export class GifService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private router = inject(Router);

  /** Signal: Almacena los GIFs en tendencia. */
  trendingGifs = signal<Gif[]>([]);

  /** Signal: Indica si los GIFs en tendencia están cargando. */
  trendingGifsLoading = signal(true);

  /** Signal: Historial de búsquedas (clave: término). Se carga desde localStorage. */
  searchHistory = signal<Record<string, Gif[]>>(
    loadFronmLocalStorage(this.isBrowser)
  );

  /** Computed: Expone las claves (términos) del historial. */
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  constructor() {
    this.loadTrendingGifs();
  }

  /** Effect: Guarda automáticamente el historial en localStorage si cambia. */
  saveGifsToLocalStorage = effect(() => {
    if (!this.isBrowser) return;
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem('gifs', historyString);
  });

  /** Obtiene los GIFs en tendencia desde la API de Giphy. */
  loadTrendingGifs() {
    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 21,
        },
      })
      .pipe(
        catchError(() => {
          this.router.navigate(['/error']);
          return of(undefined);
        })
      )
      .subscribe((resp) => {
        if (!resp) return;
        const gifs = GifMapper.mapGiphyItemToGifArray(resp.data);
        this.trendingGifs.set(gifs);
        this.trendingGifsLoading.set(false);
        console.log({ gifs });
      });
  }

  /**
   * Busca GIFs por un término, actualiza el historial y devuelve un Observable con los resultados.
   */
  searchGifs(query: string): Observable<Gif[]> {
    const lowerCaseQuery = query.toLocaleLowerCase();
    return this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 21,
          q: lowerCaseQuery,
        },
      })
      .pipe(
        // 1. Mapea la respuesta para obtener los GIFs y adaptarlos a la interfaz local.
        map(({ data }) => GifMapper.mapGiphyItemToGifArray(data)),
        // 2. Actualiza el historial de búsqueda (mantiene los 5 más recientes).
        tap((items) => {
          this.searchHistory.update((currentHistory) => {
            const newHistory = { ...currentHistory };
            if (newHistory[lowerCaseQuery]) {
              delete newHistory[lowerCaseQuery];
            }
            newHistory[lowerCaseQuery] = items;

            const keys = Object.keys(newHistory);
            if (keys.length > 4) {
              const oldestKey = keys[0];
              delete newHistory[oldestKey];
            }
            return newHistory;
          });
        }),
        // 3. Maneja errores de la petición.
        catchError(() => {
          this.router.navigate(['/error']);
          return of([]);
        })
      );
  }

  /** Obtiene los GIFs de una búsqueda específica desde el historial. */
  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }

  /** Elimina una búsqueda específica del historial. */
  deleteSearchFromHistory(tag: string) {
    this.searchHistory.update((currentHistory) => {
      const newHistory = { ...currentHistory };
      delete newHistory[tag];
      return newHistory;
    });
  }
}

