/* eslint-disable no-param-reassign */
import { Integer } from '@keystonejs/fields';
import { composeHook } from '@keystonejs/list-plugins/lib/utils';

export default ({ fieldName = 'sortOrder', ...fieldOptions } = {}) => ({
  fields = {},
  hooks = {},
  ...rest
}) => {
  fields[fieldName] = {
    type: Integer,
    adminDoc: 'Set to 0 to make it the first item. If left blank, will default to the last item.',
    access: {
      read: true,
      create: true,
      update: true,
    },
    ...fieldOptions,
  };

  const newResolveInput = async ({ resolvedData, operation, listKey, context, existingItem }) => {
    const valueIsDefined = resolvedData[fieldName] !== undefined;
    const valueIsNumber = typeof resolvedData[fieldName] === 'number';

    if (
      (operation === 'create' && !valueIsNumber) ||
      (operation === 'update' && valueIsDefined && !valueIsNumber)
    ) {
      const where = existingItem ? `where: { id_not: "${existingItem.id}" }` : '';
      const { data } = await context.executeGraphQL({
        query: `
          query {
            items: all${listKey}s(
              ${where}
              sortBy: ${fieldName}_DESC
              first: 1
            ) {
              val: ${fieldName}
            }
          }
        `,
      });

      const currentMax = Math.floor(data?.items?.[0]?.val ?? -1);
      resolvedData[fieldName] = currentMax + 1;
    }

    return resolvedData;
  };

  const newBeforeChange = async ({ resolvedData, listKey, context, existingItem }) => {
    const value = resolvedData[fieldName];
    if (typeof value !== 'number') return;

    const existingWhere = existingItem ? `id_not: "${existingItem.id}"` : '';
    const { data } = await context.executeGraphQL({
      query: `
        query {
          items: all${listKey}s(
            where: {
              ${fieldName}: ${resolvedData[fieldName]}
              ${existingWhere}
            }
            first: 1
          ) {
            id
          }
        }
      `,
    });

    const existing = data?.items?.[0]?.id;
    if (!existing) return;

    // Increment existing item in slot
    await context.executeGraphQL({
      query: `
        mutation UpdateItem($id: ID!, $data: ${listKey}UpdateInput) {
          update${listKey}(id: $id, data: $data) {
            id
            ${fieldName}
          }
        }
      `,
      variables: {
        id: existing,
        data: { [fieldName]: value + 1 },
      },
    });
  };

  hooks.resolveInput = composeHook(hooks.resolveInput, newResolveInput);
  hooks.beforeChange = composeHook(hooks.beforeChange, newBeforeChange);
  return { fields, hooks, ...rest };
};
