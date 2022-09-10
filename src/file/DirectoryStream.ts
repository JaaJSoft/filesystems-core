import {Closeable} from "../Closeable";

export interface DirectoryStream<T> extends AsyncIterable<T>, Closeable {

}
