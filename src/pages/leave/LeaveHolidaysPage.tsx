import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CalendarDays, PartyPopper, Globe, Building2, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Common countries list - can be extended or pulled from lookup values
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "SG", name: "Singapore" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "KE", name: "Kenya" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
];

export default function LeaveHolidaysPage() {
  const { company } = useAuth();
  const { holidays, countryHolidays, loadingHolidays, loadingCountryHolidays, createHoliday, createCountryHoliday } = useLeaveManagement(company?.id);
  const [activeTab, setActiveTab] = useState("country");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  
  // Country holiday form
  const [isCountryDialogOpen, setIsCountryDialogOpen] = useState(false);
  const [countryFormData, setCountryFormData] = useState({
    country: "",
    name: "",
    holiday_date: undefined as Date | undefined,
    is_recurring: false,
    is_half_day: false,
    description: "",
  });

  // Company holiday form
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: "",
    holiday_date: undefined as Date | undefined,
    is_recurring: false,
    is_half_day: false,
    applies_to_all: true,
  });

  const resetCountryForm = () => {
    setCountryFormData({
      country: "",
      name: "",
      holiday_date: undefined,
      is_recurring: false,
      is_half_day: false,
      description: "",
    });
  };

  const resetCompanyForm = () => {
    setCompanyFormData({
      name: "",
      holiday_date: undefined,
      is_recurring: false,
      is_half_day: false,
      applies_to_all: true,
    });
  };

  const handleSubmitCountryHoliday = async () => {
    if (!countryFormData.country || !countryFormData.name || !countryFormData.holiday_date) return;

    await createCountryHoliday.mutateAsync({
      country: countryFormData.country,
      name: countryFormData.name,
      holiday_date: format(countryFormData.holiday_date, "yyyy-MM-dd"),
      is_recurring: countryFormData.is_recurring,
      is_half_day: countryFormData.is_half_day,
      description: countryFormData.description || null,
    });
    setIsCountryDialogOpen(false);
    resetCountryForm();
  };

  const handleSubmitCompanyHoliday = async () => {
    if (!company?.id || !companyFormData.name || !companyFormData.holiday_date) return;

    await createHoliday.mutateAsync({
      company_id: company.id,
      name: companyFormData.name,
      holiday_date: format(companyFormData.holiday_date, "yyyy-MM-dd"),
      is_recurring: companyFormData.is_recurring,
      is_half_day: companyFormData.is_half_day,
      applies_to_all: companyFormData.applies_to_all,
    });
    setIsCompanyDialogOpen(false);
    resetCompanyForm();
  };

  // Get unique countries from country holidays for filter
  const availableCountries = useMemo(() => {
    const countries = new Set(countryHolidays.map(h => h.country));
    return COUNTRIES.filter(c => countries.has(c.code));
  }, [countryHolidays]);

  // Filter country holidays by selected country
  const filteredCountryHolidays = useMemo(() => {
    if (countryFilter === "all") return countryHolidays;
    return countryHolidays.filter(h => h.country === countryFilter);
  }, [countryHolidays, countryFilter]);

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Holidays Calendar" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <PartyPopper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Holidays Calendar</h1>
            <p className="text-muted-foreground">Manage country and company holidays that don't count against leave balances</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="country" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Country Holidays
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Holidays
              </TabsTrigger>
            </TabsList>

            {activeTab === "country" ? (
              <Dialog open={isCountryDialogOpen} onOpenChange={(open) => { setIsCountryDialogOpen(open); if (!open) resetCountryForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Country Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Country Holiday</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Select
                        value={countryFormData.country}
                        onValueChange={(value) => setCountryFormData({ ...countryFormData, country: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country-name">Holiday Name *</Label>
                      <Input
                        id="country-name"
                        value={countryFormData.name}
                        onChange={(e) => setCountryFormData({ ...countryFormData, name: e.target.value })}
                        placeholder="e.g., Independence Day"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !countryFormData.holiday_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {countryFormData.holiday_date ? format(countryFormData.holiday_date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={countryFormData.holiday_date}
                            onSelect={(date) => setCountryFormData({ ...countryFormData, holiday_date: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={countryFormData.description}
                        onChange={(e) => setCountryFormData({ ...countryFormData, description: e.target.value })}
                        placeholder="Optional description"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label htmlFor="country-recurring">Recurring Annually</Label>
                        <p className="text-xs text-muted-foreground">Repeats every year on the same date</p>
                      </div>
                      <Switch
                        id="country-recurring"
                        checked={countryFormData.is_recurring}
                        onCheckedChange={(checked) => setCountryFormData({ ...countryFormData, is_recurring: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label htmlFor="country-half-day">Half Day</Label>
                        <p className="text-xs text-muted-foreground">Only half the day is off</p>
                      </div>
                      <Switch
                        id="country-half-day"
                        checked={countryFormData.is_half_day}
                        onCheckedChange={(checked) => setCountryFormData({ ...countryFormData, is_half_day: checked })}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => { setIsCountryDialogOpen(false); resetCountryForm(); }}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitCountryHoliday} 
                        disabled={!countryFormData.country || !countryFormData.name || !countryFormData.holiday_date}
                      >
                        Add Holiday
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={isCompanyDialogOpen} onOpenChange={(open) => { setIsCompanyDialogOpen(open); if (!open) resetCompanyForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Company Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Company Holiday</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Holiday Name *</Label>
                      <Input
                        id="company-name"
                        value={companyFormData.name}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                        placeholder="e.g., Company Anniversary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !companyFormData.holiday_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {companyFormData.holiday_date ? format(companyFormData.holiday_date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={companyFormData.holiday_date}
                            onSelect={(date) => setCompanyFormData({ ...companyFormData, holiday_date: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label htmlFor="company-recurring">Recurring Annually</Label>
                        <p className="text-xs text-muted-foreground">Repeats every year on the same date</p>
                      </div>
                      <Switch
                        id="company-recurring"
                        checked={companyFormData.is_recurring}
                        onCheckedChange={(checked) => setCompanyFormData({ ...companyFormData, is_recurring: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label htmlFor="company-half-day">Half Day</Label>
                        <p className="text-xs text-muted-foreground">Only half the day is off</p>
                      </div>
                      <Switch
                        id="company-half-day"
                        checked={companyFormData.is_half_day}
                        onCheckedChange={(checked) => setCompanyFormData({ ...companyFormData, is_half_day: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Label htmlFor="applies-to-all">Applies to All</Label>
                        <p className="text-xs text-muted-foreground">Applies to all departments</p>
                      </div>
                      <Switch
                        id="applies-to-all"
                        checked={companyFormData.applies_to_all}
                        onCheckedChange={(checked) => setCompanyFormData({ ...companyFormData, applies_to_all: checked })}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => { setIsCompanyDialogOpen(false); resetCompanyForm(); }}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitCompanyHoliday} 
                        disabled={!companyFormData.name || !companyFormData.holiday_date}
                      >
                        Add Holiday
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="country" className="space-y-4">
            {/* Country filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {countryFilter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setCountryFilter("all")}>
                  Clear
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Holiday</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recurring</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCountryHolidays ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCountryHolidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {countryFilter !== "all" 
                          ? `No holidays configured for ${getCountryName(countryFilter)}.`
                          : "No country holidays configured. Add country-level public holidays."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCountryHolidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell>
                          <Badge variant="outline">{getCountryName(holiday.country)}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{format(new Date(holiday.holiday_date), "EEEE, MMMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={holiday.is_half_day ? "secondary" : "default"}>
                            {holiday.is_half_day ? "Half Day" : "Full Day"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={holiday.is_recurring ? "default" : "secondary"}>
                            {holiday.is_recurring ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={holiday.is_active ? "default" : "secondary"}>
                            {holiday.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-4">
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holiday</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recurring</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingHolidays ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : holidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No company holidays configured. Add company-specific holidays.
                      </TableCell>
                    </TableRow>
                  ) : (
                    holidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{format(new Date(holiday.holiday_date), "EEEE, MMMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={holiday.is_half_day ? "secondary" : "default"}>
                            {holiday.is_half_day ? "Half Day" : "Full Day"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={holiday.is_recurring ? "default" : "secondary"}>
                            {holiday.is_recurring ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {holiday.applies_to_all ? "All Departments" : "Selected"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={holiday.is_active ? "default" : "secondary"}>
                            {holiday.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}