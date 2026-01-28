import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useVendorReviews } from "@/hooks/useVendorReviews";
import {
  Star,
  Plus,
  Loader2,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { VendorReview } from "@/types/vendor";

const reviewFormSchema = z.object({
  review_date: z.string().min(1, "Review date is required"),
  review_type: z.string().default("quarterly"),
  quality_score: z.coerce.number().min(1).max(5).optional(),
  delivery_score: z.coerce.number().min(1).max(5).optional(),
  value_score: z.coerce.number().min(1).max(5).optional(),
  responsiveness_score: z.coerce.number().min(1).max(5).optional(),
  overall_score: z.coerce.number().min(1).max(5).optional(),
  status: z.string().default("draft"),
  next_review_date: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface VendorReviewsTabProps {
  vendorId: string;
  companyId: string;
}

export function VendorReviewsTab({ vendorId, companyId }: VendorReviewsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<VendorReview | null>(null);
  const { reviews, isLoading, createReview, updateReview, deleteReview, averageScores } =
    useVendorReviews(vendorId);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      review_date: new Date().toISOString().split("T")[0],
      review_type: "quarterly",
      quality_score: undefined,
      delivery_score: undefined,
      value_score: undefined,
      responsiveness_score: undefined,
      overall_score: undefined,
      status: "draft",
      next_review_date: "",
    },
  });

  const openDialog = (review?: VendorReview) => {
    if (review) {
      setEditingReview(review);
      form.reset({
        review_date: review.review_date?.split("T")[0] || "",
        review_type: review.review_type,
        quality_score: review.quality_score || undefined,
        delivery_score: review.delivery_score || undefined,
        value_score: review.value_score || undefined,
        responsiveness_score: review.responsiveness_score || undefined,
        overall_score: review.overall_score || undefined,
        status: review.status,
        next_review_date: review.next_review_date?.split("T")[0] || "",
      });
    } else {
      setEditingReview(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ReviewFormValues) => {
    const payload = {
      review_date: data.review_date,
      review_type: data.review_type,
      quality_score: data.quality_score,
      delivery_score: data.delivery_score,
      value_score: data.value_score,
      responsiveness_score: data.responsiveness_score,
      overall_score: data.overall_score,
      status: data.status,
      next_review_date: data.next_review_date,
    };

    if (editingReview) {
      await updateReview.mutateAsync({ id: editingReview.id, ...payload });
    } else {
      await createReview.mutateAsync({ vendor_id: vendorId, ...payload });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
    };
    return (
      <Badge variant="outline" className={colors[status] || colors.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderStars = (score: number | null | undefined) => {
    if (!score) return "—";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= score ? "text-warning fill-warning" : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-1 text-sm">{score.toFixed(1)}</span>
      </div>
    );
  };

  const isPending = createReview.isPending || updateReview.isPending;

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      {averageScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Quality", value: averageScores.quality },
                { label: "Delivery", value: averageScores.delivery },
                { label: "Value", value: averageScores.value },
                { label: "Responsiveness", value: averageScores.responsiveness },
                { label: "Overall", value: averageScores.overall },
              ].map((score) => (
                <div key={score.label} className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {score.value ? score.value.toFixed(1) : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">{score.label}</div>
                  {score.value && (
                    <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(score.value / 5) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews ({reviews.length})
          </CardTitle>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews yet</p>
              <p className="text-sm mt-1">Add performance reviews for this vendor</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(parseISO(review.review_date), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{review.review_type}</TableCell>
                    <TableCell>
                      {review.reviewer ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={review.reviewer.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {review.reviewer.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{review.reviewer.full_name}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{renderStars(review.overall_score)}</TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(review)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReview.mutate(review.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReview ? "Edit Review" : "Add Review"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="review_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="review_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="project">Project-based</SelectItem>
                          <SelectItem value="adhoc">Ad-hoc</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                {[
                  { name: "quality_score" as const, label: "Quality Score" },
                  { name: "delivery_score" as const, label: "Delivery Score" },
                  { name: "value_score" as const, label: "Value Score" },
                  { name: "responsiveness_score" as const, label: "Responsiveness Score" },
                  { name: "overall_score" as const, label: "Overall Score" },
                ].map(({ name, label }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>{label}</FormLabel>
                          <span className="text-sm font-medium">
                            {field.value ? `${field.value}/5` : "—"}
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={0.5}
                            value={field.value ? [field.value] : [3]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="next_review_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Review Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingReview ? "Update" : "Submit"} Review
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
