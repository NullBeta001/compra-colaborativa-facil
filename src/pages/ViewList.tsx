
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockUsers } from "@/utils/mockData";
import { useLists } from "@/context/ListContext";
import NewItemForm from "@/components/NewItemForm";
import ItemList from "@/components/ItemList";
import Navbar from "@/components/Navbar";
import { Share, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ViewList = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lists, deleteList, shareList } = useLists();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const list = lists.find((list) => list.id === id);

  useEffect(() => {
    if (!list) {
      navigate("/");
    }
  }, [list, navigate]);

  if (!list) {
    return null;
  }

  // Encontrar os usuários que compartilham esta lista
  const sharedUsers = mockUsers.filter(user => 
    list.sharedWith.includes(user.id)
  );
  
  // Usuários que ainda não compartilham esta lista
  const availableUsers = mockUsers.filter(user => 
    !list.sharedWith.includes(user.id) && user.id !== "user-1" // user-1 é o usuário atual
  );

  const handleShare = (userId: string) => {
    shareList(list.id, userId);
    setShareDialogOpen(false);
  };
  
  const handleDelete = () => {
    deleteList(list.id);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-6 mx-auto max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">{list.title}</h2>
            <p className="text-muted-foreground">
              {list.items.length} {list.items.length === 1 ? "item" : "itens"} • 
              R$ {list.totalPrice.toFixed(2)}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Share className="h-4 w-4 mr-2" /> Compartilhar
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Compartilhar Lista</DialogTitle>
                  </DialogHeader>
                  
                  {sharedUsers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Compartilhada com</h4>
                      <div className="space-y-2">
                        {sharedUsers.map(user => (
                          <div key={user.id} className="flex items-center p-2 bg-secondary/50 rounded-md">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {availableUsers.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Adicionar pessoas</h4>
                      <div className="space-y-2">
                        {availableUsers.map(user => (
                          <Button 
                            key={user.id} 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => handleShare(user.id)}
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Todos os usuários disponíveis já têm acesso a esta lista.
                    </p>
                  )}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                      Fechar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <DropdownMenuItem className="text-destructive" onSelect={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {sharedUsers.length > 0 && (
          <div className="mb-6 flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Compartilhada com:</span>
            <div className="flex -space-x-2">
              {sharedUsers.map(user => (
                <Avatar key={user.id} className="border-2 border-background h-6 w-6">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        )}
        
        <NewItemForm listId={list.id} />
        
        <ItemList listId={list.id} items={list.items} />
      </main>
    </div>
  );
};

export default ViewList;
