"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NIL_UUID } from "@/lib/constants/companies";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCompanies, useDeleteCompany } from "@/hooks/admin";
import { API_URL } from "@/config";

export function CompanyAdminPanel() {
  const { data: companies, isLoading, isError } = useCompanies();
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();

  const [searchQuery, setSearchQuery] = useState("");

  // Filter companies based on search query
  const filteredCompanies = companies?.filter((company) => {
    const query = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(query) ||
      company.description?.toLowerCase().includes(query)
    );
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Companies</h2>
          <p className="text-sm text-muted-foreground">
            Manage company profiles used for job postings.
          </p>
        </div>
        <Link href="/member/admin/companies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Company
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
          <CardDescription>
            Search, edit, or remove existing company profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search/Filter Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or description..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Loading / Error States */}
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading companies...
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              Failed to load companies.
            </p>
          )}

          {/* Company List */}
          {!isLoading && !isError && filteredCompanies && (
            <div className="rounded-md border">
              {filteredCompanies.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No companies found matching `{searchQuery}`.
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCompanies.map((company) => {
                    const hasLogo = company.logo && company.logo !== NIL_UUID;

                    const logoUrl = hasLogo
                      ? `${API_URL}/company/logo?id=${company.logo}`
                      : null;

                    return (
                      <div
                        key={company.id}
                        className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center hover:bg-secondary/10 transition-colors"
                      >
                        {/* LEFT SIDE: Logo, Info & External Link */}
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                          {/* Logo */}
                          <a
                            href={company.websiteUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0"
                          >
                            {/* 3. Because of your setup here, if logoUrl is null, it automatically renders the placeholder! */}
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={`${company.name || "Company"} logo preview`}
                                className="h-12 w-12 rounded-md object-contain border bg-white"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md border bg-secondary flex items-center justify-center text-muted-foreground">
                                <Building2 className="h-6 w-6" />
                              </div>
                            )}
                          </a>

                          {/* Info */}
                          <div className="space-y-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <a
                                href={company.websiteUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium hover:underline flex items-center gap-1"
                              >
                                {company.name}
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </a>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 pr-4">
                              {company.description ||
                                "No description provided."}
                            </p>
                          </div>
                        </div>

                        {/* RIGHT SIDE: Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/member/admin/companies/${company.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </Link>

                          {/* SHADCN ALERT DIALOG FOR DELETION */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete{" "}
                                  <strong>{company.name}</strong> from the
                                  database. If this company is linked to any
                                  active job posts, they may break. This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCompany(company.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Yes, delete company
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
