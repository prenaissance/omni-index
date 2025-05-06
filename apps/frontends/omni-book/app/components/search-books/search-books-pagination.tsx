import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import type { paths } from "~/lib/api-types";

export type SearchBooksPaginationProps =
  paths["/api/entries"]["get"]["responses"]["200"]["content"]["application/json"]["meta"];

export const SearchBooksPagination = ({
  page,
  limit,
  total,
}: SearchBooksPaginationProps) => {
  const totalPages = Math.ceil(total / limit);
  const isLastPage = page === totalPages;
  const isSecondToLastPage = page === totalPages - 1;
  const isFirstPage = page === 1;

  return (
    <Pagination>
      <PaginationContent>
        {!isFirstPage && (
          <PaginationItem>
            <PaginationPrevious href={`?page=${page - 1}`} />
          </PaginationItem>
        )}
        {page > 2 && (
          <PaginationItem>
            <PaginationLink href={`?page=1`}>1</PaginationLink>
          </PaginationItem>
        )}
        {page > 3 && <PaginationEllipsis />}
        {page > 1 && (
          <PaginationItem>
            <PaginationLink href={`?page=${page - 1}`}>
              {page - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink isActive href={`?page=${page}`}>
            {page}
          </PaginationLink>
        </PaginationItem>
        {!isLastPage && !isSecondToLastPage && (
          <PaginationItem>
            <PaginationLink href={`?page=${page + 1}`}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {page < totalPages - 2 && <PaginationEllipsis />}
        {page < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink href={`?page=${totalPages}`}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        {isSecondToLastPage && (
          <PaginationItem>
            <PaginationLink href={`?page=${totalPages}`}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        {!isLastPage && !isSecondToLastPage && (
          <PaginationItem>
            <PaginationNext href={`?page=${page + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
