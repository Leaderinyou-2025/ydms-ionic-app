import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ILiyYdmsPartnerToken } from '../../shared/interfaces/models/liy.ydms.partner.token';
import { OrderBy } from '../../shared/enums/order-by';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsPartnerTokenService {

  private readonly fields = [
    'partner_id',
    'token',
    'create_date',
    'write_date'
  ];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * Retrieves a list of tokens based on the provided search criteria and pagination parameters.
   *
   * @param {SearchDomain} [searchDomain=[]] - The search criteria used to filter the tokens.
   * @param {number} [offset=0] - The starting point for retrieving records (pagination offset).
   * @param {number} [limit=20] - The maximum number of records to retrieve (pagination limit).
   * @param {OrderBy} [order=OrderBy.CREATE_AT_DESC] - The order in which the records should be sorted.
   * @return {Promise<ILiyYdmsPartnerToken[]>} A promise that resolves to an array of partner tokens.
   */
  public async getPartnerTokenList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsPartnerToken[]> {
    const results = await this.odooService.searchRead<ILiyYdmsPartnerToken>(
      ModelName.PARTNER_TOKEN, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Fetches the total count of tokens matching the specified search criteria.
   *
   * @param {SearchDomain} [searchDomain=[]] - An array of search conditions used to filter the token records. Defaults to an empty array if no criteria is provided.
   * @return {Promise<number>} A promise that resolves to the count of tokens matching the search criteria.
   */
  public async getCountPartnerToken(searchDomain: SearchDomain = []): Promise<number> {
    return this.odooService.searchCount<ILiyYdmsPartnerToken>(
      ModelName.PARTNER_TOKEN, searchDomain
    );
  }

  /**
   * Retrieves a list of tokens associated with a specific partner ID.
   *
   * @param {number} partnerId - The unique identifier of the partner whose tokens are to be retrieved.
   * @return {Promise<ILiyYdmsPartnerToken[]>} A promise that resolves to an array of tokens associated with the partner ID.
   */
  public async getPartnerTokensByPartnerId(partnerId: number): Promise<ILiyYdmsPartnerToken[]> {
    if (!partnerId) return [];
    const searchDomain: SearchDomain = [['partner_id', OdooDomainOperator.EQUAL, partnerId]];
    return this.getPartnerTokenList(searchDomain, 0, 0);
  }

  /**
   * Creates a new token for a partner in the system.
   *
   * @param {number} partnerId - The ID of the partner for whom the token is being created.
   * @param {string} token - The token value to be associated with the partner.
   * @return {Promise<number | undefined>} A promise that resolves to the ID of the created token, or undefined if the operation fails.
   */
  public async createPartnerToken(
    partnerId: number,
    token: string
  ): Promise<number | undefined> {
    // Check exist partner token
    const tokens = await this.getPartnerTokensByPartnerId(partnerId);
    if (tokens?.length) {
      const existToken = tokens.find(tokenItem => tokenItem.token === token);
      if (existToken) return existToken.id;
    }

    // Create a new partner token
    return this.odooService.create<ILiyYdmsPartnerToken>(
      ModelName.PARTNER_TOKEN,
      {partner_id: partnerId, token: token},
    );
  }

  /**
   * Removes a specific partner token associated with the given partner ID.
   *
   * @param {number} partnerId - The ID of the partner whose token is to be removed.
   * @param {string} token - The token to be removed.
   * @return {Promise<boolean>} A promise that resolves to `true` if the token was successfully removed or if the token does not exist, otherwise resolves based on the operation's result.
   */
  public async removePartnerToken(
    partnerId: number,
    token: string,
  ): Promise<boolean> {
    const tokens = await this.getPartnerTokensByPartnerId(partnerId);
    if (!tokens?.length) return true;
    const existToken = tokens.find(tokenItem => tokenItem.token === token);
    if (!existToken) return true;
    return this.odooService.unlink(ModelName.PARTNER_TOKEN, [existToken.id]);
  }
}
