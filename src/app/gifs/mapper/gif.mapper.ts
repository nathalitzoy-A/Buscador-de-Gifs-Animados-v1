import { Gif } from '../interface/gif.interface';
import { GiphyItem } from '../interface/gipy.interfaces';

export class GifMapper {
    static mapGiphyItemTOGif(giphyItem: GiphyItem): Gif{
        return {
            id: giphyItem.id,
            title: giphyItem.title,
            url: giphyItem.images.original.url,
        }
    }

    static mapGiphyItemToGifArray(items: GiphyItem[]): Gif[] {
        return items.map(this.mapGiphyItemTOGif);
    }
}