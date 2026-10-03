import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { rentalService } from "@/lib/database-service";
import { Rental } from "@/lib/supabase";
import ImageInput from "@/components/ui/image-input";
import { RENTAL_CATEGORIES } from "@/lib/rental-categories";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  price_per_day: "",
  image_url: "",
  published: true,
  sort_order: 0,
};

const formatPrice = (price: number) => `${new Intl.NumberFormat("vi-VN").format(price)}đ`;

const RentalManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Rental | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ["rentals", "all"],
    queryFn: () => rentalService.getAll(),
  });

  const onMutationSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ["rentals"] });
    toast({ title: "Success", description: message });
  };

  const onMutationError = (action: string) => (error: Error) => {
    toast({ title: "Error", description: `Failed to ${action}: ${error.message}`, variant: "destructive" });
  };

  const createMutation = useMutation({
    mutationFn: rentalService.create,
    onSuccess: () => { onMutationSuccess("Rental item created."); resetForm(); },
    onError: onMutationError("create item"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Rental> }) => rentalService.update(id, updates),
    onSuccess: () => { onMutationSuccess("Rental item updated."); resetForm(); },
    onError: onMutationError("update item"),
  });

  const deleteMutation = useMutation({
    mutationFn: rentalService.delete,
    onSuccess: () => onMutationSuccess("Rental item deleted."),
    onError: onMutationError("delete item"),
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Rental) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category || "",
      description: item.description || "",
      price_per_day: String(item.price_per_day),
      image_url: item.image_url || "",
      published: item.status === "published",
      sort_order: item.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this rental item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim() || undefined,
      description: formData.description.trim() || undefined,
      price_per_day: Number(formData.price_per_day.replace(/\D/g, "")) || 0,
      image_url: formData.image_url || undefined,
      status: (formData.published ? "published" : "draft") as Rental["status"],
      sort_order: formData.sort_order,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Rental House</h2>
            <p className="text-gray-400">Items for rent, shown on /rental-house</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => window.open("/rental-house", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View page
          </Button>
          <Button onClick={handleAdd} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Add item
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-gray-400">Loading...</p>}

      {!isLoading && rentals.length === 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No rental items yet.</p>
            <Button onClick={handleAdd} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add first item
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map((item) => (
          <Card key={item.id} className="bg-gray-800/50 border-gray-700 overflow-hidden">
            <div className="aspect-[4/3] bg-gray-700">
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${item.status === "published" ? "bg-green-600/20 text-green-400" : "bg-gray-600/40 text-gray-400"}`}>
                  {item.status === "published" ? "Published" : "Hidden"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.category && <p className="text-xs uppercase tracking-wider text-gray-400">{item.category}</p>}
              <p className="text-yellow-400 font-bold">{formatPrice(item.price_per_day)} <span className="text-gray-400 font-normal text-sm">/ ngày</span></p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => handleEdit(item)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent border-red-600/50 text-red-400 hover:bg-red-600/20" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit rental item" : "Add rental item"}</DialogTitle>
            <DialogDescription className="text-gray-400">Name, price per day, photo and a short description.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="rental-name" className="text-white">Name *</Label>
              <Input
                id="rental-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Sony FX3 + 2 pin"
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rental-category" className="text-white">Category</Label>
              <Input
                id="rental-category"
                list="rental-category-options"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="VD: Body, Lens, Đèn..."
                className="bg-gray-800 border-gray-600 text-white"
              />
              <datalist id="rental-category-options">
                {RENTAL_CATEGORIES.map((c) => <option key={c} value={c} />)}
              </datalist>
              <div className="flex flex-wrap gap-1.5">
                {RENTAL_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: c })}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${formData.category === c ? "bg-yellow-500 border-yellow-500 text-gray-900" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rental-price" className="text-white">Price per day (VND) *</Label>
              <Input
                id="rental-price"
                inputMode="numeric"
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value.replace(/\D/g, "") })}
                placeholder="VD: 500000"
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
              {formData.price_per_day && (
                <p className="text-sm text-yellow-400">{formatPrice(Number(formData.price_per_day))} / ngày</p>
              )}
            </div>
            <ImageInput
              label="Photo"
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              placeholder="Upload photo or paste URL"
              bucket="images"
              folder="rentals"
            />
            <div className="space-y-2">
              <Label htmlFor="rental-desc" className="text-white">Description</Label>
              <Textarea
                id="rental-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tình trạng, phụ kiện đi kèm, điều kiện thuê..."
                rows={4}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="rental-published" className="text-white">Show on website</Label>
                <p className="text-xs text-gray-400">Turn off to hide without deleting</p>
              </div>
              <Switch
                id="rental-published"
                className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-gray-600"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                {isSaving ? "Saving..." : editingItem ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentalManager;
