import {Comparable} from "../../Comparable";
import {Instant} from "@js-joda/core";
import {floatToInt} from "../../utils";

/* The FileTime class represents a time in the file system */
export class FileTime implements Comparable<FileTime> {

    public readonly instant: Instant;

    public constructor(instant: Instant) {
        this.instant = instant;
    }

    /**
     * Converts a number of milliseconds since the epoch to a FileTime.
     * @param {number} value - The number of milliseconds since the epoch of 1970-01-01T00:00:00Z
     * @returns A new instance of FileTime
     */
    public static fromMillis(value: number): FileTime {
        return new FileTime(Instant.ofEpochMilli(floatToInt(value)));
    }

    /**
     * Converts a number of seconds since the epoch to a FileTime
     * @param {number} value - The number of seconds since the epoch of 1970-01-01T00:00:00Z
     * @returns A new instance of FileTime.
     */
    public static fromSeconds(value: number): FileTime {
        return new FileTime(Instant.ofEpochSecond(floatToInt(value)));
    }

    public static from(instant: Instant): FileTime {
        return new FileTime(instant);
    }

    /**
     * It returns the number of milliseconds since the epoch of 1970-01-01T00:00:00Z.
     * @returns The number of milliseconds since the epoch.
     */
    public toMillis() {
        return this.instant.toEpochMilli();
    }

    /**
     * This function returns the instant truncated to seconds
     * @returns The instant is being truncated to seconds.
     */
    public toSeconds() {
        return this.instant.epochSecond();
    }

    /**
     * This function returns the instant that this date-time represents.
     * @returns The instant
     */
    public toInstant(): Instant {
        return this.instant;
    }

    /**
     * The compareTo function compares the current FileTime object to the passed in FileTime object
     * @param {FileTime} o - FileTime
     * @returns The number of seconds between this time and that time.
     */
    public compareTo(o: FileTime): number {
        return this.instant.compareTo(o.toInstant());
    }
}
