import { useLocation } from "react-router";
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
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const isLastPage = page === totalPages;
  const isSecondToLastPage = page === totalPages - 1;
  const isFirstPage = page === 1;

  const location = useLocation();
  console.log(location);

  const buildPageLink = (targetPage: number) => {
    const params = new URLSearchParams(location.search);
    params.set("page", targetPage.toString());
    return `${location.pathname}?${params.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        {!isFirstPage && (
          <PaginationItem>
            <PaginationPrevious href={buildPageLink(page - 1)} />
          </PaginationItem>
        )}
        {page > 2 && (
          <PaginationItem>
            <PaginationLink href={buildPageLink(1)}>1</PaginationLink>
          </PaginationItem>
        )}
        {page > 3 && <PaginationEllipsis />}
        {page > 1 && (
          <PaginationItem>
            <PaginationLink href={buildPageLink(page - 1)}>
              {page - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink isActive href={buildPageLink(page)}>
            {page}
          </PaginationLink>
        </PaginationItem>
        {!isLastPage && !isSecondToLastPage && totalPages !== 0 && (
          <PaginationItem>
            <PaginationLink href={buildPageLink(page + 1)}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {page < totalPages - 2 && <PaginationEllipsis />}
        {page < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink href={buildPageLink(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        {isSecondToLastPage && (
          <PaginationItem>
            <PaginationLink href={buildPageLink(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
        {!isLastPage && !isSecondToLastPage && totalPages !== 0 && (
          <PaginationItem>
            <PaginationNext href={buildPageLink(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
