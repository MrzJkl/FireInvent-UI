import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PersonFormDialog } from '@/features/persons/PersonFormDialog';
import { usePersons } from '@/features/persons/usePersons';
import { type PersonModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';

export default function PersonsPage() {
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PersonModel | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PersonModel | null>(null);

  const {
    persons,
    initialLoading,
    creating,
    updating,
    deleting,
    createPerson,
    updatePerson,
    deletePerson,
  } = usePersons();

  useEffect(() => {
    if (!formOpen) setEditingItem(null);
  }, [formOpen]);

  if (initialLoading) return <LoadingIndicator />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('personPlural')}</h1>
        <Button
          onClick={() => {
            setEditingItem(null);
            setFormOpen(true);
          }}
        >
          {t('add')}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('firstName')}</TableHead>
            <TableHead>{t('lastName')}</TableHead>
            <TableHead>{t('contactInfo')}</TableHead>
            <TableHead>{t('externalId')}</TableHead>
            <TableHead>{t('remarks')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {persons.map((person) => (
            <TableRow key={person.id}>
              <TableCell>{person.firstName}</TableCell>
              <TableCell>{person.lastName}</TableCell>
              <TableCell>{person.contactInfo}</TableCell>
              <TableCell>{person.externalId}</TableCell>
              <TableCell>{person.remarks}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingItem(person);
                    setFormOpen(true);
                  }}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setItemToDelete(person);
                    setConfirmOpen(true);
                  }}
                >
                  {t('delete')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PersonFormDialog
        open={formOpen}
        mode={editingItem ? 'edit' : 'create'}
        initialValues={
          editingItem
            ? {
                firstName: editingItem.firstName,
                lastName: editingItem.lastName,
                remarks: editingItem.remarks ?? '',
                contactInfo: editingItem.contactInfo ?? '',
                externalId: editingItem.externalId ?? '',
              }
            : undefined
        }
        loading={editingItem ? updating : creating}
        onOpenChange={setFormOpen}
        labels={{
          titleCreate: t('persons.add'),
          titleEdit: t('persons.edit'),
          firstName: t('firstName'),
          lastName: t('lastName'),
          contactInfo: t('contactInfo'),
          externalId: t('externalId'),
          remarks: t('remarks'),
          cancel: t('cancel'),
          save: t('save'),
          add: t('add'),
        }}
        onSubmit={async (values) => {
          if (editingItem) {
            await updatePerson(editingItem.id, values);
          } else {
            await createPerson(values);
          }
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setItemToDelete(null);
        }}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDescription', {
          name: `${itemToDelete?.firstName ?? ''} ${itemToDelete?.lastName ?? ''}`,
        })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmVariant="destructive"
        confirmDisabled={deleting}
        onConfirm={async () => {
          if (!itemToDelete) return;
          await deletePerson(itemToDelete.id);
          setConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
