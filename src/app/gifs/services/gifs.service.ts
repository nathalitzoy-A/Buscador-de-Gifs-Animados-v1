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

const loadFronmLocalStorage = (isBrowser: boolean) => {
  if (!isBrowser) return {};
  const gifsFromLocalStorage = localStorage.getItem('gifs') ?? '{}';
  const gifs = JSON.parse(gifsFromLocalStorage);
  return gifs;
};

@Injectable({ providedIn: 'root' })
export class GifService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private router = inject(Router);

  trendingGifs = signal<Gif[]>([]);

  trendingGifsLoading = signal(true);

  searchHistory = signal<Record<string, Gif[]>>(
    loadFronmLocalStorage(this.isBrowser)
  );
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  constructor() {
    this.loadTrendingGifs();
  }

  saveGifsToLocalStorage = effect(() => {
    if (!this.isBrowser) return;
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem('gifs', historyString);
  });

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
        map(({ data }) => data),
        map((items) => GifMapper.mapGiphyItemToGifArray(items)),
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
        catchError(() => {
          this.router.navigate(['/error']);
          return of([]);
        })
      );
  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }

  deleteSearchFromHistory(tag: string) {
    this.searchHistory.update((currentHistory) => {
      const newHistory = { ...currentHistory };
      delete newHistory[tag];
      return newHistory;
    });
  }
}
