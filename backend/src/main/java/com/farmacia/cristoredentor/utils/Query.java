package com.farmacia.cristoredentor.utils;

import java.lang.reflect.Field;
import java.util.Comparator;
import java.util.List;

public class Query {

    public static Pagination normalizePage(
            Integer page,
            Integer limit
    ) {

        int p = (page == null) ? 1 : page;

        if (p < 1) {
            p = 1;
        }

        int l = (limit == null) ? 10 : limit;

        if (l < 1) {
            l = 1;
        }

        if (l > 100) {
            l = 100;
        }

        return new Pagination(p, l);
    }

    public static <T> List<T> orderByProp(
            List<T> src,
            String sort,
            String order
    ) {

        if (sort == null || sort.trim().isEmpty()) {
            return src;
        }

        if (src.isEmpty()) {
            return src;
        }

        try {

            Field field = src.get(0)
                    .getClass()
                    .getDeclaredField(sort);

            field.setAccessible(true);

            Comparator<T> comparator = (a, b) -> {

                try {

                    Object valA = field.get(a);
                    Object valB = field.get(b);

                    if (valA == valB) {
                        return 0;
                    }

                    if (valA == null) {
                        return 1;
                    }

                    if (valB == null) {
                        return -1;
                    }

                    if (valA instanceof String &&
                            valB instanceof String) {

                        return ((String) valA)
                                .compareToIgnoreCase(
                                        (String) valB
                                );
                    }

                    if (valA instanceof Comparable &&
                            valB instanceof Comparable) {

                        return ((Comparable) valA)
                                .compareTo(valB);
                    }

                    return 0;

                } catch (IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
            };

            src.sort(comparator);

            if ("desc".equalsIgnoreCase(order)) {
                src.sort(comparator.reversed());
            }

            return src;

        } catch (NoSuchFieldException e) {

            return src;
        }
    }

    public static record Pagination(int page, int limit) {
        public int getOffset() {
            return (page - 1) * limit;
        }

        public int getPage() {
            return page;
        }

        public int getLimit() {
            return limit;
        }
    }
}