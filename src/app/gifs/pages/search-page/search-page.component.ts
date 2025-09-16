import {  Component, inject, signal } from '@angular/core';
import { GifListComponent } from '../../components/gif-list/gif-list.component';
import { GifService } from '../../services/gifs.service';
import { Gif } from '../../interface/gif.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-page',
  imports: [GifListComponent, CommonModule],
  templateUrl: './search-page.component.html',
})
export default class SearchPageComponent {
  GifService = inject(GifService)  
  gifs = signal<Gif[]>([]);
  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  onSearch(input: HTMLInputElement) {
    const query = input.value;
    if (query.trim().length === 0) return;

    this.hasSearched.set(true);
    this.isLoading.set(true);
    this.GifService.searchGifs(query).subscribe((resp) => {
      this.gifs.set(resp);
      this.isLoading.set(false);
    });

    input.value = '';
  };
}