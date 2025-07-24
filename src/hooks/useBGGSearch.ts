import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BGGService from "@/services/BGGService";

export const useBGGSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bgg-search', searchTerm],
    queryFn: () => BGGService.searchGames(searchTerm),
    enabled: searchTerm.length > 2,
    retry: 1,
  });

  const search = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      refetch();
    }
  };

  return {
    searchResults: searchResults || [],
    isLoading,
    error,
    search,
    searchTerm
  };
};