import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { Globe, Coins, Languages, List } from "lucide-react";
import { CountriesTab } from "./tabs/CountriesTab";
import { CurrenciesTab } from "./tabs/CurrenciesTab";
import { LanguagesTab } from "./tabs/LanguagesTab";
import { LookupValuesTab } from "./tabs/LookupValuesTab";

export function ReferenceDataBrowser() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("countries");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="countries" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{t("hrHub.refData.countries")}</span>
          <span className="sm:hidden">Countries</span>
        </TabsTrigger>
        <TabsTrigger value="currencies" className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          <span className="hidden sm:inline">{t("hrHub.refData.currencies")}</span>
          <span className="sm:hidden">Currencies</span>
        </TabsTrigger>
        <TabsTrigger value="languages" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{t("hrHub.refData.languages")}</span>
          <span className="sm:hidden">Languages</span>
        </TabsTrigger>
        <TabsTrigger value="lookups" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">{t("hrHub.refData.lookupValues")}</span>
          <span className="sm:hidden">Lookups</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="countries">
        <CountriesTab />
      </TabsContent>

      <TabsContent value="currencies">
        <CurrenciesTab />
      </TabsContent>

      <TabsContent value="languages">
        <LanguagesTab />
      </TabsContent>

      <TabsContent value="lookups">
        <LookupValuesTab />
      </TabsContent>
    </Tabs>
  );
}
