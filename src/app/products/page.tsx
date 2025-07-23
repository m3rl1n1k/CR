'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Frown, PlusCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts } from '@/lib/api';
import { useTranslation } from '@/hooks/use-translation';
import { PrivateRoute } from '@/components/auth/private-route';


function useProductsData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts.map(p => ({
            ...p,
            id: p.id!,
            productionLine: p.productionLine || 'N/A'
        })));
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  return { products, loading };
}

function ProductsTable({ products, loading }: { products: Product[], loading: boolean }) {
  const { t } = useTranslation();

  if (loading) {
    return (
        <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
  }

  if (products.length === 0) {
      return (
          <TableBody>
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                   <div className="flex flex-col items-center justify-center gap-2">
                      <Frown className="w-8 h-8 text-muted-foreground" />
                      <p className="font-semibold text-muted-foreground">{t('no_products_found')}</p>
                      <p className="text-sm text-muted-foreground">{t('no_products_found_desc')}</p>
                   </div>
                </TableCell>
              </TableRow>
          </TableBody>
      )
  }

  return (
      <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.title}</TableCell>
              <TableCell>{product.code}</TableCell>
              <TableCell>{product.productionLine?.split('/').pop() || 'N/A'}</TableCell>
            </TableRow>
          ))}
      </TableBody>
  );
}


function ProductsPageContent() {
  const { products, loading } = useProductsData();
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('products')}
            </h1>
            <p className="text-muted-foreground">
              {t('products_desc')}
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t('add_product')}
          </Button>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('product_list')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('product_title')}</TableHead>
                  <TableHead>{t('product_code')}</TableHead>
                  <TableHead>{t('assigned_production_line')}</TableHead>
                </TableRow>
              </TableHeader>
              <ProductsTable products={products} loading={loading} />
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


export default function ProductsPage() {
    return (
        <PrivateRoute>
            <ProductsPageContent />
        </PrivateRoute>
    )
}
