
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Plus, 
  Star, 
  Search, 
  MoreVertical, 
  Trash, 
  Edit, 
  X,
  Loader2 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import instrumentService from '@/services/instrumentService';
import { Watchlist as WatchlistType, WatchlistItem, Instrument, AddInstrumentDTO } from '@/types/watchlist';

const Watchlist: React.FC = () => {
  const [selectedWatchlist, setSelectedWatchlist] = useState<WatchlistType | null>(null);
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);
  const [isEditingWatchlist, setIsEditingWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Instrument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingWatchlistName, setEditingWatchlistName] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch all watchlists
  const { data: watchlists = [], isLoading, error } = useQuery({
    queryKey: ['watchlists'],
    queryFn: api.watchlist.getAll,
  });

  // Create watchlist mutation
  const createWatchlistMutation = useMutation({
    mutationFn: api.watchlist.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setNewWatchlistName('');
      setIsCreatingWatchlist(false);
      toast.success('Watchlist created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create watchlist: ${error.message}`);
    },
  });

  // Update watchlist mutation
  const updateWatchlistMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      api.watchlist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setIsEditingWatchlist(false);
      toast.success('Watchlist updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update watchlist: ${error.message}`);
    },
  });

  // Delete watchlist mutation
  const deleteWatchlistMutation = useMutation({
    mutationFn: api.watchlist.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      if (selectedWatchlist) {
        setSelectedWatchlist(null);
      }
      toast.success('Watchlist deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete watchlist: ${error.message}`);
    },
  });

  // Add instrument mutation
  const addInstrumentMutation = useMutation({
    mutationFn: ({ watchlistId, instrumentData }: { watchlistId: number; instrumentData: AddInstrumentDTO }) => 
      api.watchlist.addInstrument(watchlistId, instrumentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setIsAddingSymbol(false);
      setSearchQuery('');
      setSearchResults([]);
      toast.success('Symbol added to watchlist successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add symbol: ${error.message}`);
    },
  });

  // Remove instrument mutation
  const removeInstrumentMutation = useMutation({
    mutationFn: ({ watchlistId, instrumentKey }: { watchlistId: number; instrumentKey: number }) => 
      api.watchlist.removeItem(watchlistId, instrumentKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success('Symbol removed from watchlist');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove symbol: ${error.message}`);
    },
  });

  // Effect to set the first watchlist as selected when data loads
  useEffect(() => {
    if (watchlists.length > 0 && !selectedWatchlist) {
      setSelectedWatchlist(watchlists[0]);
    }
  }, [watchlists, selectedWatchlist]);

  // Handle watchlist selection
  const handleWatchlistChange = (value: string) => {
    const watchlist = watchlists.find(w => w.id.toString() === value);
    if (watchlist) {
      setSelectedWatchlist(watchlist);
    }
  };

  // Handle creating a new watchlist
  const handleCreateWatchlist = () => {
    if (!newWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }
    
    if (watchlists.length >= 5) {
      toast.error('Maximum limit of 5 watchlists reached');
      return;
    }
    
    createWatchlistMutation.mutate({ name: newWatchlistName });
  };

  // Handle updating a watchlist name
  const handleUpdateWatchlist = () => {
    if (!selectedWatchlist) return;
    
    if (!editingWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }
    
    updateWatchlistMutation.mutate({ 
      id: selectedWatchlist.id, 
      data: { name: editingWatchlistName } 
    });
  };

  // Handle deleting a watchlist
  const handleDeleteWatchlist = () => {
    if (!selectedWatchlist) return;
    deleteWatchlistMutation.mutate(selectedWatchlist.id);
  };

  // Handle searching for instruments
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await instrumentService.searchInstruments(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching instruments:', error);
      toast.error('Failed to search instruments');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle adding an instrument to the watchlist
  const handleAddInstrument = (instrument: Instrument) => {
    if (!selectedWatchlist) {
      toast.error('Please select a watchlist first');
      return;
    }
    
    if (selectedWatchlist.items.length >= 10) {
      toast.error('Maximum limit of 10 symbols per watchlist reached');
      return;
    }
    
    const instrumentData: AddInstrumentDTO = {
      instrument_key: instrument.instrument_token,
      trading_symbol: instrument.tradingsymbol,
      instrument_name: instrument.name
    };
    
    addInstrumentMutation.mutate({
      watchlistId: selectedWatchlist.id,
      instrumentData
    });
  };

  // Handle removing an instrument from the watchlist
  const handleRemoveInstrument = (item: WatchlistItem) => {
    if (!selectedWatchlist) return;
    
    removeInstrumentMutation.mutate({
      watchlistId: selectedWatchlist.id,
      instrumentKey: item.instrument_key
    });
  };

  if (error) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Failed to load watchlists</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Watchlist
        </CardTitle>
        <div className="flex items-center gap-2">
          {selectedWatchlist && (
            <Select defaultValue={selectedWatchlist.id.toString()} onValueChange={handleWatchlistChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select watchlist" />
              </SelectTrigger>
              <SelectContent>
                {watchlists.map((watchlist) => (
                  <SelectItem key={watchlist.id} value={watchlist.id.toString()}>
                    {watchlist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                if (selectedWatchlist) {
                  setEditingWatchlistName(selectedWatchlist.name);
                  setIsEditingWatchlist(true);
                }
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Rename Watchlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteWatchlist}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Watchlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={isAddingSymbol} onOpenChange={setIsAddingSymbol}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add Symbol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Symbol to Watchlist</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    placeholder="Search symbol or company name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </div>
                <Button type="submit" size="sm" className="px-3" onClick={handleSearch}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="max-h-72 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((instrument) => (
                        <TableRow key={instrument.instrument_token}>
                          <TableCell className="font-medium">{instrument.tradingsymbol}</TableCell>
                          <TableCell>{instrument.name}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAddInstrument(instrument)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : searchQuery && !isSearching ? (
                  <p className="text-sm text-center py-4 text-muted-foreground">No results found</p>
                ) : null}
              </div>
              
              <DialogFooter className="sm:justify-end">
                <Button variant="outline" onClick={() => setIsAddingSymbol(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Watchlist Dialog */}
          <Dialog open={isCreatingWatchlist} onOpenChange={setIsCreatingWatchlist}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2 h-8">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Watchlist</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Watchlist Name"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingWatchlist(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWatchlist}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Watchlist Dialog */}
          <Dialog open={isEditingWatchlist} onOpenChange={setIsEditingWatchlist}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Watchlist</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Watchlist Name"
                value={editingWatchlistName}
                onChange={(e) => setEditingWatchlistName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditingWatchlist(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateWatchlist}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : selectedWatchlist ? (
          selectedWatchlist.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedWatchlist.items.map((item) => (
                  <TableRow key={item.id} className="table-row-hover cursor-pointer">
                    <TableCell className="font-medium">{item.trading_symbol}</TableCell>
                    <TableCell>{item.instrument_name}</TableCell>
                    <TableCell className="text-right">
                      {item.lastPrice ? `₹${item.lastPrice.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.change !== null && item.changePercent !== null ? (
                        <span className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
                          {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.change >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%)
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="w-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveInstrument(item)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No symbols in this watchlist</p>
              <Button 
                variant="link" 
                onClick={() => setIsAddingSymbol(true)}
                className="mt-2"
              >
                Click to add symbols
              </Button>
            </div>
          )
        ) : watchlists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No watchlists found</p>
            <Button 
              variant="link" 
              onClick={() => setIsCreatingWatchlist(true)}
              className="mt-2"
            >
              Create your first watchlist
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Watchlist;
