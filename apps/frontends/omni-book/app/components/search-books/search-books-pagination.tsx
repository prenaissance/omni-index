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
  return (
    <Pagination>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink isActive href="#">
            {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">{page + 1}</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">{page + 2}</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
