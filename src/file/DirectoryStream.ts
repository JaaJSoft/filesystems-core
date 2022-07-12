import {Closeable} from "../Closeable";

export interface DirectoryStream<T> extends Iterable<T>, Closeable {

}
