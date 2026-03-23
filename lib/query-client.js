import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// Fewer round-trips for entity lists; screens still invalidate on mutation / pull-to-refresh
			staleTime: 45_000,
			gcTime: 10 * 60_000,
		},
	},
});