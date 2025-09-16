import { Gif } from '../interface/gif.interface';
import { GiphyItem } from '../interface/gipy.interfaces';

/**
 * Clase para convertir (mapear) la respuesta de la API de Giphy a la interfaz de nuestra aplicación.
 * Esto desacopla nuestra app de la estructura de datos de la API externa.
 */
export class GifMapper {
    /** Convierte un solo GiphyItem a un objeto Gif. */
    static mapGiphyItemTOGif(giphyItem: GiphyItem): Gif{
        return {
            id: giphyItem.id,
            title: giphyItem.title,
            url: giphyItem.images.original.url,
        }
    }

    /** Convierte un arreglo de GiphyItem a un arreglo de Gif. */
    static mapGiphyItemToGifArray(items: GiphyItem[]): Gif[] {
        return items.map(this.mapGiphyItemTOGif);
    }
}